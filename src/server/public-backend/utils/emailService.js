import nodemailer from 'nodemailer';
import db from '../Database/db.js';
import { parseRecipients } from '../../form-settings-validation.js';
import { DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE } from '../../../lib/khudii-form-catalog.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createTransporter(configuration) {
  const { smtpHost, smtpPort, smtpSecure, smtpUsername, smtpPassword } = configuration;

  if (!smtpHost || !smtpUsername || !smtpPassword) {
    throw new Error('Owner SMTP configuration is incomplete');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort || 465),
    secure: Boolean(Number(smtpSecure)),
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });
}

async function getOwnerConfiguration() {
  const [rows] = await db.promise().query(`
    SELECT
      email,
      sender_email,
      sender_app_password,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_username,
      smtp_password,
      smtp_from
    FROM owners
    WHERE email IS NOT NULL
      AND email <> ''
    ORDER BY id ASC
    LIMIT 1
  `);

  const owner = rows[0];

  if (!owner?.email) {
    throw new Error('Owner recipient email is not configured');
  }

  return {
    ownerEmail: owner.email.trim(),
    smtpHost: owner.smtp_host || (owner.sender_email && owner.sender_app_password ? 'smtp.gmail.com' : ''),
    smtpPort: owner.smtp_port || 465,
    smtpSecure: owner.smtp_secure ?? 1,
    smtpUsername: owner.smtp_username || owner.sender_email,
    smtpPassword: owner.smtp_password || String(owner.sender_app_password || '').replace(/\s+/g, ''),
    fromAddress: owner.smtp_from || owner.smtp_username || owner.sender_email,
  };
}

function renderRows(rows) {
  return rows
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value], idx, arr) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:${idx === arr.length - 1 ? 'none' : '1px solid #f1f5f9'};font-weight:700;color:#1e293b;font-size:13px;width:36%;background-color:#f8fafc;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;border-bottom:${idx === arr.length - 1 ? 'none' : '1px solid #f1f5f9'};color:#334155;font-size:13px;white-space:pre-wrap;line-height:1.5">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('');
}

// Sanitize unsafe tags (script, iframe, object, embed, form, input) and javascript: URLs.
// Preserves styles, tables, classes, attributes for rich responsive email templates.
function sanitizeEmailHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|iframe|object|embed|form|input|svg|math|base)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|form|input|svg|math|base)\b[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, 'href="#"');
}

export function renderEmailTemplate(markup, values = {}) {
  const detailsTable = values.details_table || '';
  const dateStr = values.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formName = values.form_name || values.formName || 'Sample Form Submission';
  const footerStr = values.footer || 'Khudii Welfare Organization';

  let rendered = String(markup || '')
    .replace(/\{details_table\}/gi, detailsTable)
    .replace(/\{date\}/gi, escapeHtml(dateStr))
    .replace(/\{submission_date\}/gi, escapeHtml(dateStr))
    .replace(/\{form_name\}/gi, escapeHtml(formName))
    .replace(/\{name\}/gi, escapeHtml(values.name || ''))
    .replace(/\{email\}/gi, escapeHtml(values.email || ''))
    .replace(/\{subject\}/gi, escapeHtml(values.subject || ''))
    .replace(/\{message\}/gi, escapeHtml(values.message || ''))
    .replace(/\{footer\}/gi, escapeHtml(footerStr));

  return sanitizeEmailHtml(rendered);
}

function emailHtml(title, rows, note = '', customMarkup = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style type="text/css">
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
</style>
</head>
<body style="margin: 0; padding: 28px 0; background-color: #f1f5f9;">
  <center style="width: 100%; background-color: #f1f5f9;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 36px 24px 28px; text-align: center; background: linear-gradient(135deg, #02236E 0%, #06399c 100%); border-bottom: 4px solid #ed0026;">
          <div style="display: inline-block; padding: 5px 18px; border: 1.5px solid #d4af37; border-radius: 9999px; margin-bottom: 14px; background-color: rgba(0,0,0,0.15);">
            <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #ffd700; text-transform: uppercase;">INQUIRY NOTIFICATION</span>
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">${escapeHtml(title)}</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: #93c5fd; font-weight: 500;">Khudii Welfare Organization &middot; Pakistan's First Digital Platform</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #ffffff; padding: 32px 28px;">
          <h2 style="margin: 0 0 14px; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; color: #02236E; text-transform: uppercase;">
            SUBMITTED FORM DETAILS
          </h2>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
            ${renderRows(rows)}
          </table>
          ${customMarkup ? `<div style="margin-top: 20px; font-size: 13px; line-height: 1.6; color: #334155;">${customMarkup}</div>` : note ? `<div style="margin-top: 20px; padding: 14px 18px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #475569; white-space: pre-wrap;">${escapeHtml(note)}</div>` : ''}
          <p style="margin: 24px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">Submitted on ${escapeHtml(new Date().toLocaleString())}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px; text-align: center; background-color: #0c1322; font-size: 12px; line-height: 1.6; color: #94a3b8; border-top: 1px solid #1e293b;">
          <p style="margin: 0 0 4px; font-weight: 700; color: #f8fafc; font-size: 13px;">Khudii Welfare Organization</p>
          <p style="margin: 0 0 10px; color: #cbd5e1;">Lahore, Pakistan &middot; (+92) 3198 - KHUDII (548344)</p>
          <div style="border-top: 1px solid #1e293b; padding-top: 12px; font-size: 11px; color: #64748b;">
            &copy; 2026 Khudii Welfare Organization. All Rights Reserved. Design &amp; Developed by <a href="https://dks.com.pk" target="_blank" rel="noopener noreferrer" style="color: #ed0026; text-decoration: none; font-weight: 700;">DKS</a>
          </div>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

async function sendWithConfiguration(configuration, subject, html, recipients = {}) {
  const transporter = createTransporter(configuration);

  const mailOptions = {
    from: configuration.fromAddress,
    to: (recipients.to && String(recipients.to).trim()) ? String(recipients.to).trim() : configuration.ownerEmail,
    subject,
    html,
  };

  if (recipients.cc && String(recipients.cc).trim()) {
    mailOptions.cc = String(recipients.cc).trim();
  }
  if (recipients.bcc && String(recipients.bcc).trim()) {
    mailOptions.bcc = String(recipients.bcc).trim();
  }

  return transporter.sendMail(mailOptions);
}

// Email rules are optional: keep the original notifications working on older databases.
async function getNotificationSettings() {
  try {
    const [rows] = await db.promise().query("SELECT content FROM khudii_admin_settings WHERE bucket='smtp' LIMIT 1");
    return rows.length ? JSON.parse(rows[0].content) || {} : {};
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') console.warn('Email settings fallback:', error.message);
    return {};
  }
}
async function getFormsEmailSettings() {
  try {
    const [rows] = await db.promise().query("SELECT content FROM khudii_admin_settings WHERE bucket='forms' LIMIT 1");
    const doc = rows.length ? JSON.parse(rows[0].content) : {};
    return doc && typeof doc === 'object' ? doc : {};
  } catch (error) { console.error('[Khudii email routes] Cannot load form routing settings:', error.message); return {}; }
}
async function recordDelivery({ kind, to = '', cc = '', bcc = '', subject = '', status, messageId = '', error = '' }) {
  try {
    await db.promise().query('INSERT INTO khudii_email_delivery_logs (form_key,recipient_to,recipient_cc,recipient_bcc,subject,delivery_status,message_id,error_message) VALUES (?,?,?,?,?,?,?,?)', [
      String(kind || 'unknown').slice(0, 40), String(to).slice(0, 2048), String(cc).slice(0, 2048), String(bcc).slice(0, 2048), String(subject).slice(0, 255), status, String(messageId).slice(0, 255) || null, String(error).slice(0, 500) || null,
    ]);
  } catch (e) { console.error('[Khudii mail audit] Log unavailable:', e.message); }
}
const EMAIL_FORM_MAP = { contact: 'contact', inquiry: 'inquiry', volunteer: 'volunteer', job: 'jobs', story: 'story', donation: 'donate', org: 'organization', blog: 'contact' };
function formRecipients(forms, kind, ownerEmail) {
  const key = EMAIL_FORM_MAP[kind] || 'contact';
  const rule = (forms.emailConfigs?.formRoutingRules || []).find(item => Array.isArray(item.forms) && item.forms.includes(key));
  if (!rule) return { key, to: ownerEmail, cc: '', bcc: '' };
  const to = parseRecipients(rule.sendTo).join(', ');
  const cc = parseRecipients(rule.cc).join(', ');
  const bcc = parseRecipients(rule.bcc).join(', ');
  return { key, to: to || ownerEmail, cc, bcc };
}
function notificationKind(subject) {
  if (/contact inquiry/i.test(subject)) return 'inquiry';
  if (/contact/i.test(subject)) return 'contact';
  if (/volunteer/i.test(subject)) return 'volunteer';
  if (/job/i.test(subject)) return 'job';
  if (/story/i.test(subject)) return 'story';
  if (/donation/i.test(subject)) return 'donation';
  if (/organization registration/i.test(subject)) return 'org';
  if (/blog/i.test(subject)) return 'blog';
  return '';
}
function templateValue(template, data) {
  return String(template || '').replace(/\{(name|email|subject|message)\}/gi, (_, key) => String(data[key.toLowerCase()] || ''));
}
async function sendOwnerEmail(subject, title, rows, note = '') {
  const kind = notificationKind(subject);
  let recipients = { key: EMAIL_FORM_MAP[kind] || 'contact', to: '', cc: '', bcc: '' };
  let finalSubject = subject;
  try {
    const [options, forms] = await Promise.all([getNotificationSettings(), getFormsEmailSettings()]);
    const configuration = await getOwnerConfiguration();
    recipients=formRecipients(forms,kind,configuration.ownerEmail);
    if (options.smtp_enabled === false || (kind && options[`notify_${kind}`] === false)) {
      await recordDelivery({ kind: recipients.key, ...recipients, subject, status: 'skipped' });
      return true;
    }
    const values = Object.fromEntries(rows.map(([key, value]) => [String(key).toLowerCase(), value]));
    values.name = values.name || values.donor || values.applicant || values.organization || values.contactpersonname || '';
    values.email = values.email || values.emailaddress || values.user_google_email || '';
    values.subject = values.subject || subject;
    values.message = values.message || values.story || '';
    const standard = options.templates?.[kind] || {};
    const custom = forms.emailTemplate?.perForm?.[recipients.key] || {};
    const subjectTemplate = custom.subject?.trim() || standard.subject?.trim();
    finalSubject = subjectTemplate ? templateValue(subjectTemplate, values).slice(0, 255) : subject;
    const notes = [note, standard.body?.trim() ? templateValue(standard.body, values) : '', custom.intro?.trim() ? templateValue(custom.intro, values) : ''].filter(Boolean).join('\n\n');
    const heading = title;
    const footer = forms.emailTemplate?.footer?.trim() || 'Khudii Welfare Organization';
    const rawTemplate = forms.emailTemplate?.html?.trim() || DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE;
    const isFullDoc = /<!DOCTYPE\s+html|<html\b/i.test(rawTemplate);
    let html;
    if (isFullDoc) {
      html = renderEmailTemplate(rawTemplate, {
        ...values,
        form_name: heading,
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        details_table: renderRows(rows),
        footer,
      });
    } else {
      const customMarkup = rawTemplate ? renderEmailTemplate(rawTemplate, { ...values, message: [values.message, notes].filter(Boolean).join('\n\n') }) : '';
      html = emailHtml(heading, rows, [notes, footer].filter(Boolean).join('\n\n'), customMarkup);
    }
    const adminTo = (recipients.to && String(recipients.to).trim()) ? String(recipients.to).trim() : configuration.ownerEmail;
    const adminCc = (recipients.cc && String(recipients.cc).trim()) ? String(recipients.cc).trim() : undefined;
    const adminBcc = (recipients.bcc && String(recipients.bcc).trim()) ? String(recipients.bcc).trim() : undefined;
    const delivered = await sendWithConfiguration(configuration, finalSubject, html, {
      to: adminTo,
      cc: adminCc,
      bcc: adminBcc,
    });
    await recordDelivery({ kind: recipients.key, to: adminTo, cc: adminCc || '', bcc: adminBcc || '', subject: finalSubject, status: 'sent', messageId: delivered?.messageId });

    // Customer confirmation delivery:
    const customerEmail = String(values.email || '').trim();
    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      try {
        const customerSubject = `Confirmation: ${finalSubject}`;
        const custDelivered = await sendWithConfiguration(configuration, customerSubject, html, {
          to: customerEmail,
          cc: undefined,
          bcc: undefined,
        });
        await recordDelivery({
          kind: `${recipients.key}_customer`,
          to: customerEmail,
          cc: '',
          bcc: '',
          subject: customerSubject,
          status: 'sent',
          messageId: custDelivered?.messageId,
        });
      } catch (custError) {
        console.warn('[Khudii email] Customer confirmation email delivery failed:', custError?.message || custError);
        await recordDelivery({
          kind: `${recipients.key}_customer`,
          to: customerEmail,
          cc: '',
          bcc: '',
          subject: `Confirmation: ${finalSubject}`,
          status: 'failed',
          error: String(custError?.message || 'Customer delivery failed').slice(0, 500),
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Email delivery failed:', error?.message || error);
    await recordDelivery({ kind: recipients.key, ...recipients, subject: finalSubject, status: 'failed', error: 'SMTP delivery failed; check server mail settings and delivery provider logs' });
    return false;
  }
}

export async function sendContactInquiryEmail(inquiryData) {
  return sendOwnerEmail(
    `New Contact Inquiry - ${inquiryData.org_id || 'General'}`,
    'New Contact Inquiry',
    [
      ['Name', inquiryData.name],
      ['Email', inquiryData.email],
      ['Phone', `${inquiryData.country_code ? `+${inquiryData.country_code} ` : ''}${inquiryData.phone || ''}`],
      ['Country', inquiryData.country_name],
      ['Organization', inquiryData.org_id],
      ['Message', inquiryData.message || 'No message provided'],
    ],
  );
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
    ['Country', obj.CountryName || obj.country], ['City', obj.city], ['Preferred contact date', obj.contactTime], ['Message', obj.message],
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
