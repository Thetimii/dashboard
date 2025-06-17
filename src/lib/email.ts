// Email template utilities for customer notifications

export interface CustomerKickoffData {
  businessName?: string;
  businessDescription?: string;
  websiteStyle?: string;
  desiredPages?: string[];
  colorPreferences?: string;
  logoUrl?: string;
  contentUploadUrl?: string;
  specialRequests?: string;
  userEmail?: string;
  userName?: string;
}

export function generateKickoffCompletionEmail(customerData: CustomerKickoffData) {
  const subject = `🚀 New Customer Kickoff: ${customerData.businessName || 'Unknown Business'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Customer Kickoff</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #14B8A6; }
        .pages-list { list-style: none; padding: 0; }
        .pages-list li { background: white; margin: 5px 0; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #06B6D4; }
        .file-link { color: #14B8A6; text-decoration: none; font-weight: 500; }
        .file-link:hover { text-decoration: underline; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎉 New Customer Kickoff Completed!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A new customer has submitted their website requirements</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="label">👤 Customer Information</span>
          <div class="value">
            <strong>Name:</strong> ${customerData.userName || 'Not provided'}<br>
            <strong>Email:</strong> ${customerData.userEmail || 'Not provided'}
          </div>
        </div>

        <div class="section">
          <span class="label">🏢 Business Name</span>
          <div class="value">${customerData.businessName || 'Not provided'}</div>
        </div>

        <div class="section">
          <span class="label">📝 Business Description</span>
          <div class="value">${customerData.businessDescription || 'Not provided'}</div>
        </div>

        <div class="section">
          <span class="label">🎨 Website Style Preference</span>
          <div class="value">${customerData.websiteStyle || 'Not provided'}</div>
        </div>

        <div class="section">
          <span class="label">🌈 Color Preferences</span>
          <div class="value">${customerData.colorPreferences || 'Not provided'}</div>
        </div>

        ${customerData.desiredPages && customerData.desiredPages.length > 0 ? `
        <div class="section">
          <span class="label">📄 Desired Pages</span>
          <ul class="pages-list">
            ${customerData.desiredPages.map(page => `<li>${page}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${customerData.logoUrl ? `
        <div class="section">
          <span class="label">🖼️ Logo Upload</span>
          <div class="value">
            <a href="${customerData.logoUrl}" class="file-link" target="_blank">📎 Download Logo File</a>
          </div>
        </div>
        ` : ''}

        ${customerData.contentUploadUrl ? `
        <div class="section">
          <span class="label">📁 Content Upload</span>
          <div class="value">
            <a href="${customerData.contentUploadUrl}" class="file-link" target="_blank">📎 Download Content File</a>
          </div>
        </div>
        ` : ''}

        ${customerData.specialRequests ? `
        <div class="section">
          <span class="label">💬 Special Requests</span>
          <div class="value">${customerData.specialRequests}</div>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>This email was automatically generated when a customer completed their kickoff form.</p>
        <p>Customer Flows Dashboard • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
New Customer Kickoff Completed!

Customer Information:
- Name: ${customerData.userName || 'Not provided'}
- Email: ${customerData.userEmail || 'Not provided'}

Business Details:
- Business Name: ${customerData.businessName || 'Not provided'}
- Description: ${customerData.businessDescription || 'Not provided'}
- Website Style: ${customerData.websiteStyle || 'Not provided'}
- Color Preferences: ${customerData.colorPreferences || 'Not provided'}

${customerData.desiredPages && customerData.desiredPages.length > 0 ? `
Desired Pages:
${customerData.desiredPages.map(page => `- ${page}`).join('\n')}
` : ''}

${customerData.logoUrl ? `Logo Upload: ${customerData.logoUrl}` : ''}
${customerData.contentUploadUrl ? `Content Upload: ${customerData.contentUploadUrl}` : ''}
${customerData.specialRequests ? `Special Requests: ${customerData.specialRequests}` : ''}

Generated on: ${new Date().toLocaleString()}
  `;

  return { subject, html, text };
}

export async function sendKickoffNotificationEmail(customerData: CustomerKickoffData) {
  try {
    const { subject, html, text } = generateKickoffCompletionEmail(customerData);

    const response = await fetch('/api/send-email-resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        html,
        text,
        customerData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API responded with status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send kickoff notification email:', error);
    throw error;
  }
}
