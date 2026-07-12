import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const refreshSchema = new mongoose.Schema({
  token: { type: String, required: true },
  device: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'affiliate'], 
    default: 'customer' 
  },
  isEmailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  tradingViewUsername: { type: String, trim: true },
  googleId: { type: String },
  refreshTokens: [refreshSchema],
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'banned'], 
    default: 'active' 
  }
}, {
  timestamps: true
});

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
