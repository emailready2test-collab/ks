import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationService } from '../utils/validation.js';
import { errorService } from '../utils/errorService.js';
import { sendOTP } from '../utils/otp.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, farmDetails } = req.body;

    // Validate input
    const validation = validationService.validateUserRegistration({
      name, phone, email, password, farmDetails
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone or email'
      });
    }

    // Create new user
    const user = new User({
      name,
      phone,
      email,
      password,
      farmDetails: farmDetails || {}
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP (in production, integrate with SMS service)
    try {
      await sendOTP(phone, otp);
    } catch (otpError) {
      console.error('OTP sending failed:', otpError);
      // Continue without failing registration
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify with OTP.',
      data: {
        userId: user._id,
        phone: user.phone,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    const appError = errorService.handleApiError(error, 'register');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          farmDetails: user.farmDetails,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    const appError = errorService.handleApiError(error, 'verifyOTP');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    try {
      await sendOTP(phone, otp);
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (otpError) {
      console.error('OTP sending failed:', otpError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    const appError = errorService.handleApiError(error, 'resendOTP');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Login with phone and password
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your account with OTP first'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          farmDetails: user.farmDetails,
          preferences: user.preferences,
          statistics: user.statistics
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    const appError = errorService.handleApiError(error, 'login');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP for password reset
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    try {
      await sendOTP(phone, otp);
      res.json({
        success: true,
        message: 'OTP sent for password reset'
      });
    } catch (otpError) {
      console.error('OTP sending failed:', otpError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    const appError = errorService.handleApiError(error, 'forgotPassword');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and new password are required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // Clear OTP
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    const appError = errorService.handleApiError(error, 'resetPassword');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          farmDetails: user.farmDetails,
          preferences: user.preferences,
          statistics: user.statistics,
          subscription: user.subscription,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    const appError = errorService.handleApiError(error, 'getProfile');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.otp;
    delete updates.isVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    const appError = errorService.handleApiError(error, 'updateProfile');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;