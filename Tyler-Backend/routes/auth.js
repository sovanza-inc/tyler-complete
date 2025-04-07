const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

// Signup route
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


// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

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
      expiresAt: Date.now() + 120000,
    }


    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expires in 2 minutes.`,
    };

    await transporter.sendMail(mailOptions);

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
