import nodemailer from 'nodemailer';
import db from '../Database/db.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createTransporter(senderEmail, appPassword) {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || senderEmail,
        pass: process.env.SMTP_PASSWORD || appPassword,
      },
    });
  }

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user: senderEmail, pass: appPassword },
  });
}

async function getOwnerConfiguration() {
  const environmentSender = process.env.SMTP_USER;
  const environmentPassword = process.env.SMTP_PASSWORD;
  const environmentRecipient = process.env.NOTIFICATION_EMAIL;

  if (environmentSender && environmentPassword && environmentRecipient) {
    return {
      senderEmail: environmentSender,
      appPassword: environmentPassword,
      ownerEmail: environmentRecipient,
      fromAddress: process.env.SMTP_FROM || environmentSender,
    };
  }

  const [rows] = await db.promise().query('SELECT * FROM owners LIMIT 1');
  const owner = rows[0] || {};
  const senderEmail = environmentSender || owner.sender_email;
  const appPassword = environmentPassword || owner.sender_app_password;
  const ownerEmail = environmentRecipient || owner.email;

  if (!senderEmail || !appPassword || !ownerEmail) {
    throw new Error('Owner email configuration is incomplete');
  }
  return {
    senderEmail,
    appPassword,
    ownerEmail,
    fromAddress: process.env.SMTP_FROM || senderEmail,
  };
}

function renderRows(rows) {
  return rows
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;vertical-align:top;width:36%">${escapeHtml(label)}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('');
}

function emailHtml(title, rows, note = '') {
  return `
    <div style="background:#f3f4f6;padding:24px;font-family:Arial,sans-serif;color:#111827">
      <div style="max-width:760px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#02246e;padding:24px;text-align:center">
          <img src="https://khudii.com/khudiilogo.png" alt="Khudii" style="max-width:180px;height:auto" />
          <h1 style="color:#fff;font-size:24px;margin:14px 0 0">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse">${renderRows(rows)}</table>
          ${note ? `<div style="margin-top:20px;padding:14px;background:#eff6ff;border-radius:6px;white-space:pre-wrap">${escapeHtml(note)}</div>` : ''}
          <p style="margin:20px 0 0;color:#6b7280;font-size:13px">Submitted at ${escapeHtml(new Date().toLocaleString())}</p>
        </div>
      </div>
    </div>`;
}

async function sendWithConfiguration({ senderEmail, appPassword, ownerEmail, fromAddress }, subject, html) {
  const transporter = createTransporter(senderEmail, appPassword);
  return transporter.sendMail({
    from: fromAddress || process.env.SMTP_FROM || senderEmail,
    to: ownerEmail,
    subject,
    html,
  });
}

async function sendOwnerEmail(subject, title, rows, note = '') {
  try {
    const configuration = await getOwnerConfiguration();
    await sendWithConfiguration(configuration, subject, emailHtml(title, rows, note));
    return true;
  } catch (error) {
    console.error(`Email delivery failed (${subject}):`, error);
    return false;
  }
}

export async function sendContactInquiryEmail(senderEmail, appPassword, inquiryData, ownerEmail) {
  try {
    await sendWithConfiguration(
      { senderEmail, appPassword, ownerEmail },
      `New Contact Inquiry - ${inquiryData.org_id || 'General'}`,
      emailHtml('New Contact Inquiry', [
        ['Name', inquiryData.name],
        ['Email', inquiryData.email],
        ['Phone', `${inquiryData.country_code ? `+${inquiryData.country_code} ` : ''}${inquiryData.phone || ''}`],
        ['Country', inquiryData.country_name],
        ['Organization', inquiryData.org_id],
        ['Message', inquiryData.message || 'No message provided'],
      ]),
    );
    return true;
  } catch (error) {
    console.error('Contact inquiry email failed:', error);
    return false;
  }
}

export const sendContactEmail = (obj) =>
  sendOwnerEmail(
    `New Contact Form Submission - ${obj.subject || 'General Inquiry'}`,
    'New Contact Form Submission',
    [
      ['Name', obj.name], ['Email', obj.email],
      ['Phone', `${obj.countryCode ? `+${obj.countryCode} ` : ''}${obj.phone || ''}`],
      ['Country', obj.CountryName || obj.country], ['Subject', obj.subject], ['Message', obj.message],
    ],
  );

export const sendVolunteerEmail = (obj) =>
  sendOwnerEmail(`New Volunteer Application - ${obj.name}`, 'New Volunteer Application', [
    ['Name', obj.name], ['Email', obj.email],
    ['Phone', `${obj.countryCode ? `+${obj.countryCode} ` : ''}${obj.phone || ''}`],
    ['Country', obj.CountryName || obj.country], ['Preferred contact time', obj.contactTime], ['Message', obj.message],
  ]);

export const sendJobApplicationEmail = (obj) =>
  sendOwnerEmail(`New Job Application - ${obj.interestedPost || 'General Position'}`, 'New Job Application', [
    ['Applicant', obj.name], ['Email', obj.email],
    ['Phone', `${obj.countryCode ? `+${obj.countryCode} ` : ''}${obj.phone || ''}`],
    ['Country', obj.CountryName || obj.country], ['Experience', obj.experience],
    ['Qualification', obj.qualification], ['Interested post', obj.interestedPost], ['Message', obj.message],
  ]);

export const sendStoryEmail = (obj) =>
  sendOwnerEmail(`New Story Contribution - ${obj.name}`, 'New Story Contribution', [
    ['Entity type', obj.entityType], ['Name', obj.name], ['Email', obj.email],
    ['Phone', `${obj.countryCode ? `+${obj.countryCode} ` : ''}${obj.phone || ''}`],
    ['Country', obj.CountryName || obj.country], ['Company / organization', obj.company], ['Story', obj.story],
  ]);

export const sendDonationEmail = (obj) =>
  sendOwnerEmail(`New Donation - ${obj.firstName} ${obj.lastName}`, 'New Donation Submission', [
    ['Donor', `${obj.firstName || ''} ${obj.lastName || ''}`.trim()], ['Email', obj.email],
    ['Phone', `${obj.countryCode ? `+${obj.countryCode} ` : ''}${obj.phone || ''}`],
    ['Country', obj.CountryName || obj.country], ['Donation amount', obj.donationAmount],
    ['Donation type', obj.donationType], ['Address', obj.address1], ['City', obj.city],
    ['State', obj.state], ['Message', obj.message],
  ]);

export const sendOrganizationSubmissionEmail = (submissionData) =>
  sendOwnerEmail(
    `New Organization Registration - ${submissionData.organizationName}`,
    'New Organization Registration',
    [
      ['Organization', submissionData.organizationName], ['Contact person', submissionData.contactPersonName],
      ['Mobile', submissionData.contactPersonMobile], ['Landline', submissionData.landlineUan],
      ['Website', submissionData.websiteUrl], ['Email', submissionData.emailAddress],
      ['Facebook', submissionData.facebookLink], ['Instagram', submissionData.instagramLink],
      ['YouTube', submissionData.youtubeLink], ['LinkedIn', submissionData.linkedinLink],
      ['Twitter / X', submissionData.twitterLink], ['Year established', submissionData.yearEstablished],
      ['Total beneficiaries served', submissionData.totalBeneficiariesServed],
      ['Total projects completed', submissionData.totalProjectsCompleted],
      ['Active projects', submissionData.activeProjects],
      ['Organization logo', submissionData.organizationLogoPath ? 'Uploaded' : 'Not uploaded'],
      ['Supporting documents', `${submissionData.supportingDocumentsCount || 0} file(s)`],
      ['Google account', submissionData.user_google_email],
    ],
  );
