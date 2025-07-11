# Gmail SMTP Setup Guide

## Setting up Gmail App Password for Email Sending

### Prerequisites
- A Gmail account with 2-factor authentication enabled
- Access to your Google account security settings

### Steps to Create App Password

1. **Enable 2-Factor Authentication** (if not already enabled)
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - You may need to sign in again
   - Select "Mail" from the "Select app" dropdown
   - Select "Other (Custom name)" from the "Select device" dropdown
   - Enter "AI Market Watch" as the custom name
   - Click "Generate"
   - Copy the 16-character password that appears

3. **Update Environment Variables**
   - Open `.env.local` file
   - Update the following variables:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### Important Notes
- The app password is different from your regular Gmail password
- Keep the app password secure and don't commit it to version control
- The app password bypasses 2-factor authentication for this specific app
- Gmail has a sending limit of 500 emails per day for free accounts

### Troubleshooting

**Error: Invalid login**
- Make sure you're using the app password, not your regular password
- Check that 2-factor authentication is enabled
- Verify the email address is correct

**Error: Connection timeout**
- Check your internet connection
- Verify Gmail SMTP is not blocked by your firewall
- Try using port 587 (TLS) or 465 (SSL)

**Email not received**
- Check spam/junk folder
- Verify recipient email address
- Check Gmail sending limits (500/day)

### Alternative: Using a Professional Email Service

For production use, consider using professional email services:
- **SendGrid**: 100 emails/day free
- **Resend**: 100 emails/day free
- **Postmark**: 100 emails/month free
- **Amazon SES**: Pay-as-you-go pricing

These services offer better deliverability, analytics, and higher sending limits.