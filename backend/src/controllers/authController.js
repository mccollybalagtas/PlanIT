import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const isProd = config.nodeEnv === 'production';
  const options = {
    expires: new Date(Date.now() + config.cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled,
        reminderTime: user.reminderTime,
        role: user.role || 'user',
      }
    });
};

const sendEmail = async (options) => {
  if (!config.email.user || !config.email.pass) {
    throw new Error('Email service not configured');
  }
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: { rejectUnauthorized: true },
  });
  await transporter.sendMail({
    from: `"PlanIt Security" <${config.email.user}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
};

const sanitizeInput = (str, maxLen = 100) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

export const register = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;
  name = sanitizeInput(name, 50);
  email = sanitizeInput(email, 100).toLowerCase();
  password = typeof password === 'string' ? password : '';

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number',
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  email = sanitizeInput(email, 100).toLowerCase();
  password = typeof password === 'string' ? password : '';

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  await user.resetLoginAttempts();
  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip || req.connection?.remoteAddress;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      path: '/',
    })
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled,
      reminderTime: user.reminderTime,
      role: user.role,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar, theme, notificationsEnabled, reminderTime } = req.body;

  const updateFields = {};
  if (name) updateFields.name = sanitizeInput(name, 50);
  if (email) {
    const newEmail = sanitizeInput(email, 100).toLowerCase();
    const existing = await User.findOne({ email: newEmail, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    updateFields.email = newEmail;
  }
  if (avatar !== undefined) updateFields.avatar = String(avatar).slice(0, 2000);
  if (theme && ['light', 'dark', 'system'].includes(theme)) updateFields.theme = theme;
  if (typeof notificationsEnabled === 'boolean') updateFields.notificationsEnabled = notificationsEnabled;
  if (reminderTime !== undefined) updateFields.reminderTime = Math.min(Math.max(parseInt(reminderTime, 10), 1), 1440);

  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled,
      reminderTime: user.reminderTime,
      role: user.role,
    },
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current and new password are required' });
  }

  if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ success: false, message: 'New password must be different' });
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = sanitizeInput(req.body.email, 100).toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl.replace(/\/+$/, '')}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your PlanIt account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    if (config.email.user && config.email.pass) {
      await sendEmail({
        email: user.email,
        subject: 'PlanIt - Password Reset',
        html,
      });
    }
    res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent. Please try again later.',
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(String(req.params.resettoken))
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters',
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

export const generateCsrfToken = asyncHandler(async (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
});
