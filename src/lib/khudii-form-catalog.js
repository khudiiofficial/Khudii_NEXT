export const KHUDII_FORMS = [
  { key: 'contact', name: 'Contact Page - Message Form', path: '/contact', fields: ['name', 'email', 'phone', 'subject', 'message', 'country', 'countryCode', 'CountryName'] },
  { key: 'inquiry', name: 'Organization Profile - Enquiry Form', path: '/organization/[slug]', fields: ['name', 'email', 'phone', 'message'] },
  { key: 'donate', name: 'Donation Page - Donation Form', path: '/donate-now', fields: ['firstName', 'lastName', 'email', 'phone', 'donationAmount', 'donationType', 'address1', 'city', 'state', 'country', 'message'] },
  { key: 'volunteer', name: 'Volunteer Page - Application Form', path: '/volunteer', fields: ['name', 'email', 'phone', 'country', 'CountryName', 'countryCode', 'city', 'contactTime', 'message'] },
  { key: 'jobs', name: 'Jobs Page - Job Application Form', path: '/jobs', fields: ['name', 'email', 'phone', 'country', 'countryCode', 'CountryName', 'qualification', 'experience', 'interestedPost', 'message'] },
  { key: 'story', name: 'Contribute Story - Story Submission Form', path: '/contribute-your-story', fields: ['name', 'email', 'phone', 'country', 'CountryName', 'countryCode', 'company', 'entityType', 'story'] },
  { key: 'organization', name: 'Organization - Registration Form', path: '/organization/registration', fields: ['organizationName', 'contactPersonName', 'contactPersonMobile', 'landlineUan', 'websiteUrl', 'emailAddress', 'facebookLink', 'instagramLink', 'youtubeLink', 'linkedinLink', 'twitterLink', 'yearEstablished', 'totalBeneficiariesServed', 'totalProjectsCompleted', 'activeProjects'] },
];
export const KHUDII_FORM_KEYS = KHUDII_FORMS.map(f => f.key);

export const DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sample Form Submission - Khudii Welfare Organization</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; border-radius: 0 !important; }
      .fluid-padding { padding: 20px 16px !important; }
      .header-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- HEADER BANNER -->
          <tr>
            <td align="center" style="background: #02236E; padding: 32px 24px; border-bottom: 4px solid #ed0026;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(219, 158, 48, 0.15); border: 1px solid #DB9E30; color: #ffd700; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      INQUIRY NOTIFICATION
                    </div>
                    <div style="margin: 8px 0 4px 0;">
                      <a href="https://khudii.com" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img src="https://media.khudii.com/khudii-25be32c7-e8a9-4a82-a49d-f0d694873286.png" alt="Khudii Welfare Organization" width="200" style="display: block; width: 200px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; margin: 0 auto;" />
                      </a>
                    </div>
                    <p style="color: #93c5fd; font-size: 12px; margin: 4px 0 0 0; font-weight: 600;">
                      Pakistan's First Digital Platform Promoting Welfare Organizations
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN BODY CARD -->
          <tr>
            <td class="fluid-padding" style="padding: 32px 28px; background-color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                      A new inquiry has been submitted via <strong>{form_name}</strong>. Submission details are listed below:
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; font-weight: 600;">
                          Date: <strong style="color: #0f172a;">{date}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 12px;">
                    <h3 style="color: #02236E; font-size: 14px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Submitted Form Details
                    </h3>
                  </td>
                </tr>

                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0; border: 1px solid #cbd5e1; border-radius: 14px; overflow: hidden;">
                      {details_table}
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top: 20px;">
                    <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
                      {footer}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color: #02236E; padding: 28px 24px; border-top: 1px solid #1e293b; color: #ffffff; font-size: 12px;">
              <table border="0" cellpadding="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="color:#ffffff; font-weight: 700; font-size: 14px; margin: 0 0 4px 0;">
                      Khudii Welfare Organization
                    </p>
                    <p style="color: #cbd5e1; font-size: 11px; margin: 0; line-height: 1.5;">
                      Lahore, Pakistan · (+92) 3198 - KHUDII (548344)<br>
                      Pakistan's First Digital Hub Connecting Donors, Volunteers &amp; Welfare Organizations
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="https://www.khudii.com" target="_blank" style="color: #ffd700; text-decoration: none; font-weight: 700; font-size: 12px; margin: 0 8px;">
                      Visit Official Website →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: 16px; font-size: 11px; color: #94a3b8;">
                    © 2026 Khudii Welfare Organization. All Rights Reserved. Design &amp; Developed by <a href="https://www.dks.com.pk" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #ed0026; font-weight:600;">
                      DKS
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
