import nodemailer from 'nodemailer';

// Create Gmail transporter with validation
export const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
};

// Send DNA Match Report email
export async function sendDNAMatchEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}) {
  const transporter = createEmailTransporter();

  // Retry logic for connection issues
  let retries = 3;
  let lastError: any;
  
  while (retries > 0) {
    try {
      const info = await transporter.sendMail({
        from: `"AI Market Watch Team" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        attachments,
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`Email sending error (attempt ${4 - retries}/3):`, error.message);
      lastError = error;
      retries--;
      
      if (retries > 0) {
        // Wait before retrying (1s, 2s, 3s)
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
      }
    }
  }
  
  return { success: false, error: lastError?.message || 'Unknown error' };
}

// Email template for DNA Match Report
export function createDNAMatchEmailTemplate({
  companyName,
  topMatches,
  reportUrl,
}: {
  companyName: string;
  topMatches: Array<{
    companyName: string;
    similarity: number;
    category: string;
  }>;
  reportUrl?: string;
}) {
  const matchesHtml = topMatches
    .slice(0, 3)
    .map(
      (match, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${index + 1}. ${match.companyName}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">
            ${match.category} • ${Math.round(match.similarity * 100)}% Match
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your AI Startup DNA Analysis</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      AI Market Watch
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
                      Your Startup DNA Analysis Report
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">
                      Hi ${companyName} Team! 👋
                    </h2>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      We've analyzed your startup's DNA and found some fascinating matches in our database. 
                      Your comprehensive report is ready with detailed insights and strategic recommendations.
                    </p>
                    
                    <!-- Top Matches Preview -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
                        🧬 Your Top DNA Matches
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${matchesHtml}
                      </table>
                    </div>
                    
                    <!-- What's in the report -->
                    <div style="margin-bottom: 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
                        📊 What's in Your Full Report:
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
                        <li>All 5 matched companies with detailed analysis</li>
                        <li>Common success patterns among similar startups</li>
                        <li>Market opportunities and gaps</li>
                        <li>Strategic recommendations for your growth</li>
                        <li>Potential competitors and partners</li>
                      </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      ${
                        reportUrl
                          ? `<a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              Download Your Full Report
                            </a>`
                          : `<p style="color: #6b7280; font-size: 14px;">
                              Your PDF report is attached to this email.
                            </p>`
                      }
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                      Need help understanding your report?
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Visit <a href="https://ai-market-watch.vercel.app" style="color: #f97316; text-decoration: none;">AI Market Watch</a> 
                      to explore more AI startups and insights.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}