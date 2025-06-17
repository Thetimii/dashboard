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

export interface CustomerPaymentData {
  userEmail?: string;
  userName?: string;
  businessName?: string;
  approvedOption?: string;
  paymentAmount?: number;
  stripePaymentId?: string;
  stripeCustomerId?: string;
  approvedAt?: string;
}

export interface CustomerDemoReadyData {
  userEmail?: string;
  userName?: string;
  businessName?: string;
  option1Url?: string;
  option2Url?: string;
  option3Url?: string;
}

export interface WebsiteLaunchData {
  userEmail?: string;
  userName?: string;
  businessName?: string;
  finalUrl?: string;
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

export function generatePaymentCompletionEmail(paymentData: CustomerPaymentData) {
  const subject = `💰 Payment Completed: ${paymentData.businessName || paymentData.userEmail || 'Customer'} - Option ${paymentData.approvedOption || 'Unknown'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Completed</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10B981; }
        .payment-details { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .option-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .amount { font-size: 24px; font-weight: bold; color: #10B981; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">💰 Payment Completed Successfully!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A customer has approved an option and completed their payment</p>
      </div>

      <div class="content">
        <div class="payment-details">
          <h3 style="margin: 0 0 15px 0; color: #047857;">🎉 Payment Summary</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span>Amount Paid:</span>
            <span class="amount">${paymentData.paymentAmount || 99} CHF</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span>Approved Option:</span>
            <span class="option-badge">Option ${paymentData.approvedOption || 'Unknown'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Payment Date:</span>
            <span>${paymentData.approvedAt ? new Date(paymentData.approvedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div class="section">
          <span class="label">👤 Customer Information</span>
          <div class="value">
            <strong>Name:</strong> ${paymentData.userName || 'Not provided'}<br>
            <strong>Email:</strong> ${paymentData.userEmail || 'Not provided'}<br>
            <strong>Business:</strong> ${paymentData.businessName || 'Not provided'}
          </div>
        </div>

        <div class="section">
          <span class="label">💳 Payment Details</span>
          <div class="value">
            <strong>Stripe Payment ID:</strong> ${paymentData.stripePaymentId || 'Not available'}<br>
            <strong>Stripe Customer ID:</strong> ${paymentData.stripeCustomerId || 'Not available'}
          </div>
        </div>

        <div class="section">
          <span class="label">🎯 Next Steps</span>
          <div class="value">
            The customer has approved <strong>Option ${paymentData.approvedOption || 'Unknown'}</strong> and completed their payment. 
            You can now proceed with developing their website based on the selected design option.
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This email was automatically generated when a customer completed their payment.</p>
        <p>Customer Flows Dashboard • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Completed Successfully!

Customer Information:
- Name: ${paymentData.userName || 'Not provided'}
- Email: ${paymentData.userEmail || 'Not provided'}
- Business: ${paymentData.businessName || 'Not provided'}

Payment Details:
- Amount Paid: ${paymentData.paymentAmount || 99} CHF
- Approved Option: Option ${paymentData.approvedOption || 'Unknown'}
- Payment Date: ${paymentData.approvedAt ? new Date(paymentData.approvedAt).toLocaleDateString() : new Date().toLocaleDateString()}
- Stripe Payment ID: ${paymentData.stripePaymentId || 'Not available'}
- Stripe Customer ID: ${paymentData.stripeCustomerId || 'Not available'}

Next Steps:
The customer has approved Option ${paymentData.approvedOption || 'Unknown'} and completed their payment. 
You can now proceed with developing their website based on the selected design option.

Generated on: ${new Date().toLocaleString()}
  `;

  return { subject, html, text };
}

export function generateDemoReadyEmail(demoData: CustomerDemoReadyData) {
  const subject = `🎨 Your Website Designs Are Ready! - ${demoData.businessName || 'Your Project'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Website Designs Are Ready</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #8B5CF6; }
        .demo-grid { display: grid; grid-template-columns: 1fr; gap: 15px; margin: 20px 0; }
        .demo-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
        .demo-button { background: #8B5CF6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500; }
        .demo-button:hover { background: #7C3AED; text-decoration: none; color: white; }
        .cta { background: #f3f4f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .main-cta { background: #8B5CF6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none, display: inline-block; font-weight: 600; font-size: 16px; }
        .main-cta:hover { background: #7C3AED; text-decoration: none; color: white; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎨 Your Website Designs Are Ready!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We've created three beautiful design options for your review</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="label">👋 Hello ${demoData.userName || 'there'}!</span>
          <div class="value">
            Great news! We've completed the initial design concepts for <strong>${demoData.businessName || 'your project'}</strong>. 
            We've created three different design options for you to choose from, each tailored to your specific requirements and preferences.
          </div>
        </div>

        <div class="section">
          <span class="label">🎨 Available Design Options</span>
          <div class="demo-grid">
            ${demoData.option1Url ? `
            <div class="demo-card">
              <h4>Option 1</h4>
              <p>Modern and clean design approach</p>
              <a href="${demoData.option1Url}" class="demo-button" target="_blank">View Option 1</a>
            </div>
            ` : ''}
            
            ${demoData.option2Url ? `
            <div class="demo-card">
              <h4>Option 2</h4>
              <p>Professional and business-focused</p>
              <a href="${demoData.option2Url}" class="demo-button" target="_blank">View Option 2</a>
            </div>
            ` : ''}
            
            ${demoData.option3Url ? `
            <div class="demo-card">
              <h4>Option 3</h4>
              <p>Creative and visually striking</p>
              <a href="${demoData.option3Url}" class="demo-button" target="_blank">View Option 3</a>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="cta">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Ready to Choose Your Favorite?</h3>
          <p style="margin: 0 0 20px 0; color: #6b7280;">Visit your dashboard to review all options and approve your preferred design. Once you approve an option, you can proceed with payment to finalize your website development.</p>
          <a href="${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/dashboard" class="main-cta">Go to Dashboard</a>
        </div>

        <div class="section">
          <span class="label">📝 What's Next?</span>
          <div class="value">
            <ol style="margin: 0; padding-left: 20px;">
              <li>Review each design option carefully</li>
              <li>Consider how well each aligns with your brand and goals</li>
              <li>Select your preferred option in the dashboard</li>
              <li>Complete the payment to proceed with development</li>
              <li>We'll begin building your final website based on the chosen design</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Questions? Reply to this email or contact us through your dashboard.</p>
        <p>Customer Flows Dashboard • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Website Designs Are Ready!

Hello ${demoData.userName || 'there'}!

Great news! We've completed the initial design concepts for ${demoData.businessName || 'your project'}. 
We've created three different design options for you to choose from.

Available Design Options:
${demoData.option1Url ? `- Option 1: ${demoData.option1Url}` : ''}
${demoData.option2Url ? `- Option 2: ${demoData.option2Url}` : ''}
${demoData.option3Url ? `- Option 3: ${demoData.option3Url}` : ''}

What's Next?
1. Review each design option carefully
2. Consider how well each aligns with your brand and goals  
3. Select your preferred option in the dashboard
4. Complete the payment to proceed with development
5. We'll begin building your final website based on the chosen design

Visit your dashboard: ${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/dashboard

Questions? Reply to this email or contact us through your dashboard.

Generated on: ${new Date().toLocaleString()}
  `;

  return { subject, html, text };
}

export function generateWebsiteLaunchEmail(launchData: WebsiteLaunchData) {
  const subject = `🚀 Your Website is Live! - ${launchData.businessName || 'Your Project'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Website is Live!</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .label { font-weight: 600; color: #1f2937; margin-bottom: 8px; display: block; }
        .value { background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #059669; }
        .website-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .website-url { font-size: 18px; font-weight: 600; color: #059669; margin: 15px 0; word-break: break-all; }
        .launch-button { background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; margin: 15px 0; }
        .launch-button:hover { background: #047857; text-decoration: none; color: white; }
        .celebration { font-size: 48px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="celebration">🎉🚀🎉</div>
        <h1 style="margin: 0; font-size: 28px;">Your Website is Live!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Congratulations! Your new website is now online and ready for the world to see</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="label">🎊 Congratulations ${launchData.userName || 'there'}!</span>
          <div class="value">
            We're thrilled to announce that your website for <strong>${launchData.businessName || 'your business'}</strong> is now live and accessible to the world! 
            After all the planning, designing, and development, your digital presence is ready to make an impact.
          </div>
        </div>

        <div class="website-card">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">🌟 Your Live Website</h3>
          <p style="margin: 0 0 10px 0; color: #6b7280;">Your website is now accessible at:</p>
          <div class="website-url">${launchData.finalUrl}</div>
          <a href="${launchData.finalUrl}" class="launch-button" target="_blank">Visit Your Website</a>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">Share this URL with your customers, partners, and social networks!</p>
        </div>

        <div class="section">
          <span class="label">📈 What's Next?</span>
          <div class="value">
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Share your website:</strong> Spread the word on social media and with your network</li>
              <li><strong>Monitor performance:</strong> Keep track of visitors and engagement</li>
              <li><strong>Update content:</strong> Keep your website fresh with regular updates</li>
              <li><strong>SEO optimization:</strong> Continue to improve your search engine visibility</li>
              <li><strong>Backup & maintenance:</strong> Regular updates and security checks</li>
            </ol>
          </div>
        </div>

        <div class="section">
          <span class="label">🛠️ Need Help?</span>
          <div class="value">
            If you need any assistance with your website, have questions about updates, or want to discuss additional features, 
            don't hesitate to reach out. We're here to support your online success!
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Congratulations again on your new website launch! 🎉</p>
        <p>Customer Flows Dashboard • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
🚀 Your Website is Live!

Congratulations ${launchData.userName || 'there'}!

We're thrilled to announce that your website for ${launchData.businessName || 'your business'} is now live and accessible to the world!

Your Live Website:
${launchData.finalUrl}

What's Next:
1. Share your website: Spread the word on social media and with your network
2. Monitor performance: Keep track of visitors and engagement  
3. Update content: Keep your website fresh with regular updates
4. SEO optimization: Continue to improve your search engine visibility
5. Backup & maintenance: Regular updates and security checks

Need Help?
If you need any assistance with your website, have questions about updates, or want to discuss additional features, don't hesitate to reach out. We're here to support your online success!

Congratulations again on your new website launch! 🎉

Generated on: ${new Date().toLocaleString()}
  `;

  return { subject, html, text };
}

// Direct email sending function using Resend
export async function sendEmailViaResend({
  subject,
  html,
  text,
  recipientEmail,
}: {
  subject: string;
  html: string;
  text: string;
  recipientEmail?: string;
}) {
  try {
    // Determine recipient - use recipientEmail if provided, otherwise use admin email
    const targetEmail = recipientEmail || process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    
    console.log('Target email:', targetEmail);
    console.log('Resend API key configured:', !!resendApiKey);

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    console.log('Sending email via Resend...');

    // Use direct fetch to Resend API
    const emailData = {
      from: 'Customer Flows <onboarding@resend.dev>',
      to: [targetEmail],
      subject: subject || 'Notification from Customer Flows',
      html: html || '<p>You have a new notification.</p>',
      text: text || 'You have a new notification.',
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

// Main email sending functions
export async function sendKickoffNotificationEmail(customerData: CustomerKickoffData) {
  try {
    const { subject, html, text } = generateKickoffCompletionEmail(customerData);
    return await sendEmailViaResend({ subject, html, text });
  } catch (error) {
    console.error('Failed to send kickoff notification email:', error);
    throw error;
  }
}

export async function sendPaymentCompletionEmail(paymentData: CustomerPaymentData) {
  try {
    const { subject, html, text } = generatePaymentCompletionEmail(paymentData);
    return await sendEmailViaResend({ subject, html, text });
  } catch (error) {
    console.error('Failed to send payment completion email:', error);
    throw error;
  }
}

export async function sendDemoReadyEmail(demoData: CustomerDemoReadyData) {
  try {
    const { subject, html, text } = generateDemoReadyEmail(demoData);
    return await sendEmailViaResend({ 
      subject, 
      html, 
      text, 
      recipientEmail: demoData.userEmail 
    });
  } catch (error) {
    console.error('Failed to send demo ready email:', error);
    throw error;
  }
}

export async function sendWebsiteLaunchEmail(launchData: WebsiteLaunchData) {
  try {
    const { subject, html, text } = generateWebsiteLaunchEmail(launchData);
    return await sendEmailViaResend({ 
      subject, 
      html, 
      text, 
      recipientEmail: launchData.userEmail 
    });
  } catch (error) {
    console.error('Failed to send website launch email:', error);
    throw error;
  }
}
