import mongoose from 'mongoose';

const diseaseReportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  cropInfo: {
    cropName: {
      type: String,
      required: true
    },
    variety: String,
    stage: {
      type: String,
      enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'mature'],
      default: 'vegetative'
    },
    plantingDate: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  aiAnalysis: {
    diseaseDetected: {
      type: Boolean,
      default: false
    },
    diseaseName: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    symptoms: [String],
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    affectedArea: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    analysisDate: {
      type: Date,
      default: Date.now
    },
    modelVersion: String,
    processingTime: Number // in milliseconds
  },
  treatment: {
    organic: [{
      name: String,
      description: String,
      dosage: String,
      frequency: String,
      duration: String,
      cost: Number,
      effectiveness: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    chemical: [{
      name: String,
      description: String,
      dosage: String,
      frequency: String,
      duration: String,
      cost: Number,
      effectiveness: {
        type: Number,
        min: 0,
        max: 100
      },
      safetyPrecautions: [String]
    }],
    preventive: [{
      measure: String,
      description: String,
      frequency: String,
      cost: Number
    }]
  },
  expertReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    expertDiagnosis: String,
    expertTreatment: String,
    expertNotes: String,
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  followUp: {
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: String,
    images: [String],
    improvement: {
      type: String,
      enum: ['better', 'same', 'worse'],
      default: 'same'
    }
  },
  weather: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    condition: String,
    recordedAt: Date
  },
  status: {
    type: String,
    enum: ['analyzed', 'expert_reviewed', 'treatment_applied', 'resolved', 'ongoing'],
    default: 'analyzed'
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    helpful: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
diseaseReportSchema.index({ farmerId: 1, createdAt: -1 });
diseaseReportSchema.index({ 'cropInfo.cropName': 1 });
diseaseReportSchema.index({ 'aiAnalysis.diseaseName': 1 });
diseaseReportSchema.index({ 'aiAnalysis.diseaseDetected': 1 });
diseaseReportSchema.index({ status: 1 });
diseaseReportSchema.index({ isPublic: 1, createdAt: -1 });
diseaseReportSchema.index({ tags: 1 });

// Virtual for total treatment cost
diseaseReportSchema.virtual('totalTreatmentCost').get(function() {
  let total = 0;
  
  if (this.treatment.organic) {
    total += this.treatment.organic.reduce((sum, treatment) => sum + (treatment.cost || 0), 0);
  }
  
  if (this.treatment.chemical) {
    total += this.treatment.chemical.reduce((sum, treatment) => sum + (treatment.cost || 0), 0);
  }
  
  if (this.treatment.preventive) {
    total += this.treatment.preventive.reduce((sum, treatment) => sum + (treatment.cost || 0), 0);
  }
  
  return total;
});

// Method to update status
diseaseReportSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Method to add expert review
diseaseReportSchema.methods.addExpertReview = function(expertId, diagnosis, treatment, notes, accuracy) {
  this.expertReview = {
    reviewedBy: expertId,
    reviewDate: new Date(),
    expertDiagnosis: diagnosis,
    expertTreatment: treatment,
    expertNotes: notes,
    accuracy: accuracy
  };
  this.status = 'expert_reviewed';
  return this.save();
};

// Method to schedule follow-up
diseaseReportSchema.methods.scheduleFollowUp = function(date, notes) {
  this.followUp = {
    scheduledDate: date,
    status: 'pending',
    notes: notes
  };
  return this.save();
};

// Method to add feedback
diseaseReportSchema.methods.addFeedback = function(userId, rating, comment, helpful) {
  this.feedback.push({
    user: userId,
    rating: rating,
    comment: comment,
    helpful: helpful
  });
  
  if (helpful) {
    this.helpfulCount += 1;
  }
  
  return this.save();
};

// Method to increment share count
diseaseReportSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

export default mongoose.model('DiseaseReport', diseaseReportSchema);