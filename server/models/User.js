import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['farmer', 'expert', 'admin'],
    default: 'farmer'
  },
  farmDetails: {
    farmName: String,
    location: {
      state: String,
      district: String,
      village: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    farmSize: Number, // in acres
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'red', 'black', 'alluvial'],
      default: 'loamy'
    },
    irrigationType: {
      type: String,
      enum: ['rain-fed', 'bore-well', 'canal', 'drip', 'sprinkler', 'flood'],
      default: 'rain-fed'
    },
    crops: [{
      name: String,
      variety: String,
      plantingDate: Date,
      expectedHarvestDate: Date,
      area: Number,
      status: {
        type: String,
        enum: ['planted', 'growing', 'flowering', 'fruiting', 'harvested'],
        default: 'planted'
      }
    }]
  },
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  lastLogin: Date,
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ml', 'ta', 'te', 'bn']
    },
    notifications: {
      weather: { type: Boolean, default: true },
      market: { type: Boolean, default: true },
      schemes: { type: Boolean, default: true },
      community: { type: Boolean, default: true },
      cropAlerts: { type: Boolean, default: true }
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date
  },
  statistics: {
    totalActivities: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalDiseaseReports: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  if (new Date() > this.otp.expiresAt) {
    return false;
  }
  
  return this.otp.code === otp;
};

// Update statistics
userSchema.methods.updateStatistics = function(type) {
  switch (type) {
    case 'activity':
      this.statistics.totalActivities += 1;
      break;
    case 'post':
      this.statistics.totalPosts += 1;
      break;
    case 'disease':
      this.statistics.totalDiseaseReports += 1;
      break;
  }
  return this.save();
};

// Indexes for better performance
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'farmDetails.location.district': 1 });
userSchema.index({ 'farmDetails.crops.name': 1 });

export default mongoose.model('User', userSchema);