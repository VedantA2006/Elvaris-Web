import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

// Helper to write audit logs
const logEvent = async (actorId, action, target, req, before = null, after = null) => {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      target,
      before,
      after,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, tradingViewUsername } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'An account with this email already exists.'
        }
      });
    }

    const user = new User({
      name,
      email,
      passwordHash: password, // will be hashed by mongoose pre-save hook
      tradingViewUsername: tradingViewUsername || '',
      isEmailVerified: false
    });

    await user.save();

    // Generate Verification Token (24 hours expiry)
    const verificationToken = jwt.sign(
      { id: user._id, type: 'email-verification' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '24h' }
    );

    // Development Log Verification Link
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    console.log(`\n--- EMAIL VERIFICATION LINK FOR ${email} ---`);
    console.log(verificationLink);
    console.log('---------------------------------------------\n');

    await logEvent(user._id, 'auth.register', user._id.toString(), req);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tradingViewUsername: user.tradingViewUsername,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: `Your account has been ${user.status}. Please contact support.`
        }
      });
    }

    // Refresh Token Rotation Setup
    const tokenId = crypto.randomUUID();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, tokenId);

    // Save refresh token to database
    user.refreshTokens.push({
      token: refreshToken, // For simplicity/development we store it directly; you can also hash it
      device: req.headers['user-agent'] || 'Unknown Device',
      ip: req.ip
    });

    // Enforce maximum tokens per user (e.g. max 10 active devices)
    if (user.refreshTokens.length > 10) {
      user.refreshTokens.shift();
    }

    await user.save();

    await logEvent(user._id, 'auth.login', user._id.toString(), req);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tradingViewUsername: user.tradingViewUsername,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Refresh token is required.'
        }
      });
    }

    // Verify token structure
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token is invalid or expired.'
        }
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found.'
        }
      });
    }

    // Find token in user's refresh tokens list
    const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === refreshToken);

    // Compromise Detection / Token Reuse
    if (tokenIndex === -1) {
      // Token has been reused or is already deleted (compromised!). Revoke all tokens.
      user.refreshTokens = [];
      await user.save();
      await logEvent(user._id, 'auth.token_reuse_detected', user._id.toString(), req);
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_COMPROMISE',
          message: 'Refresh token reuse detected. All sessions terminated.'
        }
      });
    }

    // Remove used token
    user.refreshTokens.splice(tokenIndex, 1);

    // Create a new token set
    const newTokenId = crypto.randomUUID();
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, newTokenId);

    // Save new refresh token
    user.refreshTokens.push({
      token: newRefreshToken,
      device: req.headers['user-agent'] || 'Unknown Device',
      ip: req.ip
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findById(req.user._id);
    if (user && refreshToken) {
      // Remove specific token
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      await user.save();
    }

    await logEvent(req.user._id, 'auth.logout', req.user._id.toString(), req);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Verification link is invalid or expired.'
        }
      });
    }

    if (decoded.type !== 'email-verification') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid verification token type.'
        }
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        }
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    user.isEmailVerified = true;
    await user.save();

    await logEvent(user._id, 'auth.verify_email', user._id.toString(), req);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // To prevent account enumeration, respond with success even if email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If that email exists, we have sent a password reset link.'
      });
    }

    // Generate Password Reset Token (1 hour expiry)
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`\n--- PASSWORD RESET LINK FOR ${email} ---`);
    console.log(resetLink);
    console.log('-----------------------------------------\n');

    await logEvent(user._id, 'auth.forgot_password_request', user._id.toString(), req);

    res.status(200).json({
      success: true,
      message: 'If that email exists, we have sent a password reset link.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Reset link is invalid or expired.'
        }
      });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid reset token type.'
        }
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        }
      });
    }

    // Set new password
    user.passwordHash = password; // pre-save hook will hash it
    // Revoke all refresh tokens for security
    user.refreshTokens = [];
    await user.save();

    await logEvent(user._id, 'auth.reset_password', user._id.toString(), req);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. All active sessions have been terminated. Please log in.'
    });
  } catch (error) {
    next(error);
  }
};
