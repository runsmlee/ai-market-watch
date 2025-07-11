// Test script for email functionality
// Run with: node scripts/test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    // Check environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Gmail credentials not found in .env.local');
      console.log('Please set GMAIL_USER and GMAIL_APP_PASSWORD');
      process.exit(1);
    }
    
    console.log('✅ Gmail credentials found');
    console.log(`📧 Using email: ${process.env.GMAIL_USER}`);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"AI Market Watch Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self
      subject: 'Test Email - AI Market Watch',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from AI Market Watch DNA Report system.</p>
        <p>If you received this email, your Gmail SMTP configuration is working correctly!</p>
        <hr>
        <p style="color: #666;">Sent at: ${new Date().toLocaleString()}</p>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Check your inbox at: ${process.env.GMAIL_USER}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Invalid login')) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Make sure you are using an App Password, not your regular Gmail password');
      console.log('2. Enable 2-factor authentication on your Google account');
      console.log('3. Generate an App Password at: https://myaccount.google.com/apppasswords');
      console.log('4. Check the docs/gmail-setup.md file for detailed instructions');
    }
  }
}

testEmail();