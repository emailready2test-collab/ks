import nodemailer from 'nodemailer';

// OTP service for sending verification codes
export const sendOTP = async (phone, otp) => {
  try {
    // In production, integrate with SMS service like Twilio, AWS SNS, or local SMS gateway
    // For now, we'll simulate OTP sending
    
    console.log(`OTP for ${phone}: ${otp}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Replace with actual SMS service integration
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: `Your Krishi Sakhi verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });
    */
    
    return { success: true, message: 'OTP sent successfully' };
    
  } catch (error) {
    console.error('OTP sending failed:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Email service for notifications
export const sendEmail = async (to, subject, html, text) => {
  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@krishisakhi.com',
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email. Please try again.');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to Krishi Sakhi!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">Welcome to Krishi Sakhi, ${userName}!</h2>
      <p>Thank you for joining our farming community. We're excited to help you with:</p>
      <ul>
        <li>Crop disease detection and treatment</li>
        <li>Community support and knowledge sharing</li>
        <li>Weather alerts and market prices</li>
        <li>Government schemes and benefits</li>
        <li>AI-powered farming assistance</li>
      </ul>
      <p>Start exploring the app and connect with fellow farmers!</p>
      <p>Best regards,<br>The Krishi Sakhi Team</p>
    </div>
  `;
  
  const text = `Welcome to Krishi Sakhi, ${userName}! Thank you for joining our farming community.`;
  
  return sendEmail(userEmail, subject, html, text);
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  const subject = 'Password Reset - Krishi Sakhi';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You requested to reset your password. Click the link below to reset your password:</p>
      <a href="${resetLink}" style="background-color: #2d5016; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The Krishi Sakhi Team</p>
    </div>
  `;
  
  const text = `Hello ${userName}, You requested to reset your password. Click this link: ${resetLink}`;
  
  return sendEmail(userEmail, subject, html, text);
};

// Send notification email
export const sendNotificationEmail = async (userEmail, userName, notification) => {
  const subject = `Krishi Sakhi Notification: ${notification.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">${notification.title}</h2>
      <p>Hello ${userName},</p>
      <p>${notification.message}</p>
      ${notification.actionUrl ? `<a href="${notification.actionUrl}" style="background-color: #2d5016; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
      <p>Best regards,<br>The Krishi Sakhi Team</p>
    </div>
  `;
  
  const text = `Hello ${userName}, ${notification.title}: ${notification.message}`;
  
  return sendEmail(userEmail, subject, html, text);
};

// Generate random OTP
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Generate random verification code
export const generateVerificationCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
};

// Validate OTP format
export const validateOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

// Check OTP expiry
export const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};