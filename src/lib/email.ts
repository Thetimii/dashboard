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

export interface DemoApprovalData {
  customerName?: string;
  customerEmail?: string;
  businessName?: string;
  approvedOption: string;
  demoUrl?: string;
  approvedAt: string;
}

export interface PaymentCompletionData {
  customerName?: string;
  customerEmail?: string;
  businessName?: string;
  approvedOption?: string;
  amount: number;
  currency: string;
  paymentId: string;
  completedAt: string;
}

export interface DemoReadyData {
  customerName?: string;
  customerEmail?: string;
  businessName?: string;
  option1Url?: string;
  option2Url?: string;
  option3Url?: string;
}

export interface WebsiteLaunchData {
  customerName?: string;
  customerEmail?: string;
  businessName?: string;
  websiteUrl?: string;
  launchedAt: string;
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

export function generateDemoApprovalEmail(data: DemoApprovalData) {
  const subject = `🎯 Demo Approved: ${data.businessName || data.customerName || 'Customer'} - Option ${data.approvedOption}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Approved</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10B981; }
        .approved-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 15px; }
        .demo-link { color: #10B981; text-decoration: none; font-weight: 500; background: white; padding: 12px; border-radius: 8px; display: block; border: 2px solid #10B981; text-align: center; margin: 10px 0; }
        .demo-link:hover { background: #10B981; color: white; text-decoration: none; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎯 Demo Option Approved!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A customer has selected their preferred demo option</p>
      </div>

      <div class="content">
        <div class="approved-badge">Option ${data.approvedOption} Selected</div>

        <div class="section">
          <span class="label">👤 Customer Information</span>
          <div class="value">
            <strong>Name:</strong> ${data.customerName || 'Not provided'}<br>
            <strong>Email:</strong> ${data.customerEmail || 'Not provided'}<br>
            <strong>Business:</strong> ${data.businessName || 'Not provided'}
          </div>
        </div>

        <div class="section">
          <span class="label">🎯 Approved Demo</span>
          <div class="value">
            <strong>Selected Option:</strong> Demo Option ${data.approvedOption}<br>
            <strong>Approved At:</strong> ${new Date(data.approvedAt).toLocaleString()}<br>
            ${data.demoUrl ? `<strong>Demo URL:</strong> <a href="${data.demoUrl}" class="demo-link" target="_blank">View Demo</a>` : ''}
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This notification was sent automatically when the customer approved their demo option.</p>
        <p>The customer will now proceed to payment to complete their project.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Demo Approved: ${data.businessName || data.customerName || 'Customer'} - Option ${data.approvedOption}

Customer Information:
- Name: ${data.customerName || 'Not provided'}
- Email: ${data.customerEmail || 'Not provided'}
- Business: ${data.businessName || 'Not provided'}

Approved Demo:
- Selected Option: Demo Option ${data.approvedOption}
- Approved At: ${new Date(data.approvedAt).toLocaleString()}
${data.demoUrl ? `- Demo URL: ${data.demoUrl}` : ''}

The customer will now proceed to payment to complete their project.
  `;

  return { subject, html, text };
}

export function generatePaymentCompletionEmail(data: PaymentCompletionData) {
  const subject = `💳 Payment Completed: ${data.businessName || data.customerName || 'Customer'} - $${(data.amount / 100).toFixed(2)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Completed</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #7C3AED; }
        .payment-badge { background: #7C3AED; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 15px; }
        .amount { font-size: 24px; font-weight: 700; color: #10B981; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">💳 Payment Completed!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A customer has successfully completed their payment</p>
      </div>

      <div class="content">
        <div class="payment-badge">Payment Successful</div>

        <div class="section">
          <span class="label">👤 Customer Information</span>
          <div class="value">
            <strong>Name:</strong> ${data.customerName || 'Not provided'}<br>
            <strong>Email:</strong> ${data.customerEmail || 'Not provided'}<br>
            <strong>Business:</strong> ${data.businessName || 'Not provided'}
          </div>
        </div>

        <div class="section">
          <span class="label">💰 Payment Details</span>
          <div class="value">
            <strong>Amount:</strong> <span class="amount">$${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</span><br>
            <strong>Payment ID:</strong> ${data.paymentId}<br>
            <strong>Completed At:</strong> ${new Date(data.completedAt).toLocaleString()}<br>
            ${data.approvedOption ? `<strong>Demo Option:</strong> Option ${data.approvedOption}` : ''}
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This notification was sent automatically when the customer completed their payment.</p>
        <p>The project can now move forward to development phase.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Completed: ${data.businessName || data.customerName || 'Customer'} - $${(data.amount / 100).toFixed(2)}

Customer Information:
- Name: ${data.customerName || 'Not provided'}
- Email: ${data.customerEmail || 'Not provided'}
- Business: ${data.businessName || 'Not provided'}

Payment Details:
- Amount: $${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}
- Payment ID: ${data.paymentId}
- Completed At: ${new Date(data.completedAt).toLocaleString()}
${data.approvedOption ? `- Demo Option: Option ${data.approvedOption}` : ''}

The project can now move forward to development phase.
  `;

  return { subject, html, text };
}

export function generateDemoReadyEmail(data: DemoReadyData) {
  const subject = `🎨 Your Website Demos Are Ready! - ${data.businessName || 'Your Project'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Website Demos Are Ready</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #14b8a6; }
        .cta-button { background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; margin: 20px 0; transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); text-decoration: none; color: white; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎨 Your Website Demos Are Ready!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We've created beautiful design options for your review</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="label">👋 Hello ${data.customerName || 'there'}!</span>
          <div class="value">
            Great news! We've completed the initial design concepts for <strong>${data.businessName || 'your project'}</strong>. 
            Three different design options are now ready for your review, each tailored to your specific requirements and preferences.
          </div>
        </div>

        <div class="section">
          <span class="label">📝 What's Next?</span>
          <div class="value">
            <p style="margin: 0 0 15px 0;">Visit your dashboard to:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review all three design options</li>
              <li>Compare how each aligns with your brand and goals</li>
              <li>Select your preferred option</li>
              <li>Complete the payment to proceed with development</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://customerflows.ch/dashboard" class="cta-button">
            🚀 View Your Demos in Dashboard
          </a>
        </div>
      </div>

      <div class="footer">
        <p>Questions? Reply to this email or contact us through your dashboard.</p>
        <p>Customer Flows • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Website Demos Are Ready!

Hello ${data.customerName || 'there'}!

Great news! We've completed the initial design concepts for ${data.businessName || 'your project'}. 
Three different design options are now ready for your review, each tailored to your specific requirements and preferences.

What's Next?
Visit your dashboard to:
- Review all three design options
- Compare how each aligns with your brand and goals
- Select your preferred option
- Complete the payment to proceed with development

View Your Demos: https://app.customerflows.ch/dashboard

Questions? Reply to this email or contact us through your dashboard.

Customer Flows
  `;

  return { subject, html, text };
}

export function generateWebsiteLaunchEmail(data: WebsiteLaunchData) {
  const subject = `🚀 Your Website is Live! - ${data.businessName || 'Your Project'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Website is Live!</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981; }
        .website-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2); }
        .website-url { font-size: 20px; font-weight: 700; margin: 15px 0; word-break: break-all; background: white; color: #059669; padding: 12px; border-radius: 8px; }
        .launch-button { background: white; color: #059669; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; margin: 20px 0; transition: all 0.3s ease; }
        .launch-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3); text-decoration: none; color: #059669; }
        .cta-button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; margin: 20px 0; transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); text-decoration: none; color: white; }
        .celebration { font-size: 48px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="celebration">🎉🚀🎉</div>
        <h1 style="margin: 0; font-size: 28px;">Your Website is Live!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Congratulations! Your new website is now online and ready for the world</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="label">🎊 Congratulations ${data.customerName || 'there'}!</span>
          <div class="value">
            We're thrilled to announce that your website for <strong>${data.businessName || 'your business'}</strong> is now live and accessible to the world! 
            Your digital presence is ready to make an impact.
          </div>
        </div>

        <div class="website-card">
          <h3 style="margin: 0 0 15px 0;">🌟 Your Live Website</h3>
          <p style="margin: 0 0 15px 0; opacity: 0.9;">Your website is now accessible at:</p>
          <div class="website-url">${data.websiteUrl}</div>
          <a href="${data.websiteUrl}" class="launch-button" target="_blank">🚀 Visit Your Website</a>
        </div>

        <div class="section">
          <span class="label">� Next Steps</span>
          <div class="value">
            <p style="margin: 0 0 15px 0;">Visit your dashboard to:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Access website management tools</li>
              <li>View performance analytics</li>
              <li>Request updates or changes</li>
              <li>Manage your subscription</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://customerflows.ch/dashboard" class="cta-button">
            📊 Manage Your Website
          </a>
        </div>
      </div>

      <div class="footer">
        <p>Congratulations again on your website launch! 🎉</p>
        <p>Customer Flows • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
🚀 Your Website is Live!

Congratulations ${data.customerName || 'there'}!

We're thrilled to announce that your website for ${data.businessName || 'your business'} is now live and accessible to the world!

Your Live Website:
${data.websiteUrl}

Next Steps:
Visit your dashboard to:
- Access website management tools
- View performance analytics  
- Request updates or changes
- Manage your subscription

Manage Your Website: https://app.customerflows.ch/dashboard

Congratulations again on your website launch! 🎉

Customer Flows
  `;

  return { subject, html, text };
}

export async function sendKickoffNotificationEmail(customerData: CustomerKickoffData) {
  try {
    const { subject, html, text } = generateKickoffCompletionEmail(customerData);

    // Call the email sending function directly instead of making HTTP requests
    return await sendEmailViaResend({
      subject,
      html,
      text,
      customerData,
    });
  } catch (error) {
    console.error('Failed to send kickoff notification email:', error);
    throw error;
  }
}

// Direct email sending function that can be called from server-side code
export async function sendEmailViaResend({
  subject,
  html,
  text,
  customerData,
  recipientEmail,
}: {
  subject: string;
  html: string;
  text: string;
  customerData?: CustomerKickoffData;
  recipientEmail?: string;
}) {
  try {
    // Use provided recipient email, or fallback to admin email for admin notifications
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';
    const toEmail = recipientEmail || adminEmail;
    const resendApiKey = process.env.RESEND_API_KEY;
    
    console.log('Sending email to:', toEmail);
    console.log('Resend API key configured:', !!resendApiKey);

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    console.log('Sending email via Resend...');

    // Use direct fetch to Resend API
    const emailData = {
      from: 'Customer Flows <info@customerflows.ch>',
      to: [toEmail],
      subject: subject || 'New Customer Kickoff Completed',
      html: html || '<p>A new customer has completed their kickoff form.</p>',
      text: text || 'A new customer has completed their kickoff form.',
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('Resend API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);

    return {
      status: 'OK',
      message: 'Email sent successfully via Resend',
      emailId: result.id,
      result: result
    };
  } catch (error) {
    console.error('Resend email sending error:', error);
    throw error;
  }
}

export async function sendKickoffNotificationEmailViaVercel(customerData: CustomerKickoffData) {
  try {
    const { subject, html, text } = generateKickoffCompletionEmail(customerData);

    // Get the current origin for absolute URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NODE_ENV === 'production'
          ? 'https://app.customerflows.ch'
          : 'http://localhost:3001';

    console.log('Sending email notification to admin via API route...');
    console.log('Base URL:', baseUrl);

    // Use the API route for sending emails
    const response = await fetch(`${baseUrl}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com', // Will be overridden by admin email in API route
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`Email API error: ${response.status}`, errorData);
      
      // Fallback to direct Resend call if API route fails
      console.log('API route failed, trying direct Resend fallback...');
      return await sendEmailViaResend({ subject, html, text, customerData });
    }

    const result = await response.json();
    console.log('Email sent successfully via API route:', result);

    return {
      status: 'OK',
      message: 'Email sent successfully via API route',
      result: result
    };
  } catch (error) {
    console.error('Failed to send kickoff notification email via API route:', error);
    
    // Fallback to direct Resend call
    try {
      console.log('Attempting direct Resend fallback...');
      return await sendEmailViaResend({ subject: '', html: '', text: '', customerData });
    } catch (fallbackError) {
      console.error('Fallback email method also failed:', fallbackError);
      throw new Error(`All email methods failed. Primary: ${error instanceof Error ? error.message : 'Unknown'}, Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`);
    }
  }
}

export async function sendDemoApprovalEmail(data: DemoApprovalData) {
  try {
    const { subject, html, text } = generateDemoApprovalEmail(data);

    console.log('Sending demo approval notification to admin...');

    // Try API route first
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NODE_ENV === 'production'
            ? 'https://app.customerflows.ch'
            : 'http://localhost:3001';

      const response = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Demo approval email sent successfully via API route:', result);
      return { status: 'OK', message: 'Email sent successfully', result };
    } catch (apiError) {
      console.log('API route failed, trying direct Resend fallback...');
      
      // Fallback to direct Resend call
      return await sendEmailViaResend({ 
        subject, 
        html, 
        text, 
        customerData: {} // Empty object since we don't need customer data here
      });
    }
  } catch (error) {
    console.error('Failed to send demo approval email:', error);
    throw error;
  }
}

export async function sendPaymentCompletionEmail(data: PaymentCompletionData) {
  try {
    const { subject, html, text } = generatePaymentCompletionEmail(data);

    console.log('Sending payment completion notification to admin...');

    // Try API route first
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NODE_ENV === 'production'
            ? 'https://app.customerflows.ch'
            : 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment completion email sent successfully via API route:', result);
      return { status: 'OK', message: 'Email sent successfully', result };
    } catch (apiError) {
      console.log('API route failed, trying direct Resend fallback...');
      
      // Fallback to direct Resend call
      return await sendEmailViaResend({ 
        subject, 
        html, 
        text, 
        customerData: {} // Empty object since we don't need customer data here
      });
    }
  } catch (error) {
    console.error('Failed to send payment completion email:', error);
    throw error;
  }
}

export async function sendDemoReadyEmail(data: DemoReadyData) {
  try {
    const { subject, html, text } = generateDemoReadyEmail(data);

    console.log('Sending demo ready notification to customer...');
    console.log('Demo ready email data:', {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      businessName: data.businessName,
      hasOption1: !!data.option1Url,
      hasOption2: !!data.option2Url,
      hasOption3: !!data.option3Url
    });

    // Try API route first
    try {
      // Use the correct production URL for API calls
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NODE_ENV === 'production'
            ? 'https://app.customerflows.ch'
            : 'http://localhost:3000';

      console.log('🚀 DEMO EMAIL DEBUG - Base URL determined:', baseUrl);
      console.log('🚀 DEMO EMAIL DEBUG - Environment check:', {
        isClient: typeof window !== 'undefined',
        vercelUrl: process.env.VERCEL_URL,
        nodeEnv: process.env.NODE_ENV,
        finalBaseUrl: baseUrl
      });

      console.log('Attempting to send email via API route:', `${baseUrl}/api/send`);
      console.log('Email data being sent:', {
        to: data.customerEmail,
        subject: subject,
        hasHtml: !!html,
        hasText: !!text
      });

      const response = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.customerEmail, // Send to customer, not admin
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API route response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${baseUrl}/api/send`
        });
        throw new Error(`API route failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Demo ready email sent successfully via API route:', result);
      return { status: 'OK', message: 'Email sent successfully', result };
    } catch (apiError) {
      console.error('API route failed with error:', apiError);
      console.log('Trying direct Resend fallback...');
      
      // Fallback to direct Resend call
      return await sendEmailViaResend({ 
        subject, 
        html, 
        text, 
        customerData: {},
        recipientEmail: data.customerEmail // Send to customer, not admin!
      });
    }
  } catch (error) {
    console.error('Failed to send demo ready email:', error);
    throw error;
  }
}

export async function sendWebsiteLaunchEmail(data: WebsiteLaunchData) {
  try {
    const { subject, html, text } = generateWebsiteLaunchEmail(data);

    console.log('Sending website launch notification to customer...');

    // Try API route first
    try {
      // Use the correct production URL for API calls
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NODE_ENV === 'production'
            ? 'https://app.customerflows.ch'
            : 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.customerEmail, // Send to customer, not admin
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Website launch email sent successfully via API route:', result);
      return { status: 'OK', message: 'Email sent successfully', result };
    } catch (apiError) {
      console.log('API route failed, trying direct Resend fallback...');
      
      // Fallback to direct Resend call
      return await sendEmailViaResend({ 
        subject, 
        html, 
        text, 
        customerData: {},
        recipientEmail: data.customerEmail // Send to customer, not admin!
      });
    }
  } catch (error) {
    console.error('Failed to send website launch email:', error);
    throw error;
  }
}
