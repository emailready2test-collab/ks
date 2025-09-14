import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'planting', 'watering', 'fertilizing', 'pest_control', 
      'harvesting', 'pruning', 'weeding', 'soil_preparation',
      'seed_treatment', 'irrigation', 'disease_control', 'other'
    ]
  },
  cropName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    fieldName: String
  },
  cost: {
    type: Number,
    min: 0,
    default: 0
  },
  quantity: {
    amount: Number,
    unit: {
      type: String,
      enum: ['kg', 'liters', 'bags', 'pieces', 'acres', 'hectares']
    }
  },
  materials: [{
    name: String,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  labor: {
    hours: Number,
    workers: Number,
    cost: Number
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  images: [String], // URLs to uploaded images
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  weather: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    condition: String,
    windSpeed: Number
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'completed'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reminder: {
    enabled: { type: Boolean, default: false },
    date: Date,
    message: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'push'
    },
    scheduledFor: Date,
    sent: { type: Boolean, default: false }
  }],
  tags: [String], // For categorization and search
  relatedActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedDuration: {
    hours: Number,
    days: Number
  },
  actualDuration: {
    hours: Number,
    days: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ farmerId: 1, date: -1 });
activitySchema.index({ farmerId: 1, status: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ cropName: 1 });
activitySchema.index({ date: -1 });
activitySchema.index({ status: 1 });
activitySchema.index({ priority: 1 });
activitySchema.index({ scheduledDate: 1, status: 1 });
activitySchema.index({ tags: 1 });

// Virtual for total cost calculation
activitySchema.virtual('totalCost').get(function() {
  let total = this.cost || 0;
  
  if (this.materials && this.materials.length > 0) {
    total += this.materials.reduce((sum, material) => sum + (material.cost || 0), 0);
  }
  
  if (this.labor && this.labor.cost) {
    total += this.labor.cost;
  }
  
  return total;
});

// Method to mark as completed
activitySchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completionPercentage = 100;
  return this.save();
};

// Method to add reminder
activitySchema.methods.addReminder = function(date, message) {
  this.reminder = {
    enabled: true,
    date: date,
    message: message
  };
  return this.save();
};

// Method to update progress
activitySchema.methods.updateProgress = function(percentage) {
  this.completionPercentage = Math.min(100, Math.max(0, percentage));
  if (this.completionPercentage === 100) {
    this.status = 'completed';
  } else if (this.completionPercentage > 0) {
    this.status = 'in_progress';
  }
  return this.save();
};

export default mongoose.model('Activity', activitySchema);