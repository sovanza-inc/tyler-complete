const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import Resend instead of Nodemailer
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Signup route code
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName
            }
        });

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        // More detailed error message
        res.status(500).json({ 
            error: 'Error creating user',
            details: error.message,
            code: error.code
        });
    }
});

// Signin route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Error during signin' });
    }
});

// Change password route
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        console.log('Attempting password change for user:', req.userId);
        
        // Validate request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        // Get user with proper error handling
        const user = await prisma.user.findUnique({
            where: { id: req.userId }  // Using req.userId from auth middleware
        });

        if (!user) {
            console.error('User not found:', req.userId);
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await prisma.user.update({
            where: { id: req.userId },  // Using req.userId from auth middleware
            data: { password: hashedPassword }
        });

        console.log('Password updated successfully for user:', req.userId);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// forgot password
// Store OTPs temporarily (in production, use a database or cache like Redis)
const otpStore = {};

// Generate and Send OTP
router.post('/generate-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 120000, // 2 minutes expiry
    };

    // Create HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #e9e9e9;
          border-radius: 5px;
        }
        .header {
          background-color: #4a6cf7;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .otp-container {
          margin: 25px 0;
          text-align: center;
        }
        .otp {
          font-size: 30px;
          font-weight: bold;
          letter-spacing: 10px;
          color: #4a6cf7;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Reset</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
          
          <div class="otp-container">
            <div class="otp">${otp}</div>
          </div>
          
          <p>This OTP will expire in 2 minutes.</p>
          <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send OTP via Resend
    const { data, error: sendError } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Using Resend's default sender for testing
      to: email,
      subject: 'Password Reset OTP',
      html: htmlTemplate,
    });

    if (sendError) {
      console.error('Error sending email with Resend:', sendError);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Confirm OTP
router.post('/confirm-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtpData = otpStore[email];

    // Check if OTP exists and is not expired
    if (!storedOtpData || storedOtpData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    // Check if the OTP matches
    if (storedOtpData.otp === otp.toString()) {
      // Clear the OTP after verification
      delete otpStore[email];
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error confirming OTP:', error);
    res.status(500).json({ error: 'Failed to confirm OTP' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // First get the user's current password from the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        error: 'New password must be different from your current password' 
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;