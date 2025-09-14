import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      text: String,
      type: {
        type: String,
        enum: ['text', 'voice', 'image', 'file'],
        default: 'text'
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'ml', 'ta', 'te', 'bn']
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      messageId: String,
      processingTime: Number,
      model: String,
      confidence: Number,
      sources: [String], // URLs or references to knowledge base
      actions: [{
        type: String,
        data: mongoose.Schema.Types.Mixed
      }]
    },
    attachments: [{
      type: String,
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    }]
  }],
  context: {
    currentTopic: String,
    previousTopics: [String],
    userPreferences: {
      language: String,
      expertise: String,
      farmType: String
    },
    sessionData: mongoose.Schema.Types.Mixed
  },
  summary: {
    topics: [String],
    keyQuestions: [String],
    recommendations: [String],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  duration: {
    startTime: Date,
    endTime: Date,
    totalMinutes: Number
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatHistorySchema.index({ farmerId: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });
chatHistorySchema.index({ status: 1 });
chatHistorySchema.index({ 'context.currentTopic': 1 });
chatHistorySchema.index({ tags: 1 });
chatHistorySchema.index({ 'summary.followUpRequired': 1, 'summary.followUpDate': 1 });

// Virtual for message count
chatHistorySchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for session duration
chatHistorySchema.virtual('sessionDuration').get(function() {
  if (this.duration.startTime && this.duration.endTime) {
    return Math.round((this.duration.endTime - this.duration.startTime) / (1000 * 60)); // minutes
  }
  return 0;
});

// Method to add message
chatHistorySchema.methods.addMessage = function(role, content, metadata = {}, attachments = []) {
  this.messages.push({
    role: role,
    content: content,
    metadata: metadata,
    attachments: attachments
  });
  
  // Update context based on message content
  this.updateContext(content);
  
  return this.save();
};

// Method to update context
chatHistorySchema.methods.updateContext = function(content) {
  if (content.text) {
    // Simple topic extraction (in production, use NLP)
    const topics = this.extractTopics(content.text);
    this.context.currentTopic = topics[0] || this.context.currentTopic;
    
    if (!this.context.previousTopics.includes(this.context.currentTopic)) {
      this.context.previousTopics.push(this.context.currentTopic);
    }
  }
};

// Method to extract topics (simplified)
chatHistorySchema.methods.extractTopics = function(text) {
  const topicKeywords = {
    'crop_disease': ['disease', 'pest', 'fungus', 'bacteria', 'virus', 'infection'],
    'fertilizer': ['fertilizer', 'nutrient', 'nitrogen', 'phosphorus', 'potassium'],
    'irrigation': ['water', 'irrigation', 'drip', 'sprinkler', 'moisture'],
    'harvest': ['harvest', 'yield', 'production', 'crop'],
    'weather': ['weather', 'rain', 'temperature', 'humidity', 'climate'],
    'market': ['price', 'market', 'sell', 'buy', 'cost'],
    'government': ['scheme', 'subsidy', 'loan', 'government', 'benefit']
  };
  
  const topics = [];
  const lowerText = text.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
};

// Method to generate summary
chatHistorySchema.methods.generateSummary = function() {
  const userMessages = this.messages.filter(msg => msg.role === 'user');
  const assistantMessages = this.messages.filter(msg => msg.role === 'assistant');
  
  this.summary = {
    topics: [...new Set(this.context.previousTopics)],
    keyQuestions: userMessages.map(msg => msg.content.text).slice(0, 5),
    recommendations: assistantMessages
      .filter(msg => msg.content.text.includes('recommend') || msg.content.text.includes('suggest'))
      .map(msg => msg.content.text)
      .slice(0, 3),
    followUpRequired: this.messages.some(msg => 
      msg.content.text.includes('follow up') || 
      msg.content.text.includes('check back')
    )
  };
  
  return this.save();
};

// Method to end session
chatHistorySchema.methods.endSession = function() {
  this.status = 'completed';
  this.duration.endTime = new Date();
  this.duration.totalMinutes = this.sessionDuration;
  this.generateSummary();
  return this.save();
};

// Method to add satisfaction rating
chatHistorySchema.methods.addSatisfactionRating = function(rating, feedback = '') {
  this.satisfaction = {
    rating: rating,
    feedback: feedback,
    ratedAt: new Date()
  };
  return this.save();
};

// Method to archive session
chatHistorySchema.methods.archiveSession = function() {
  this.status = 'archived';
  return this.save();
};

export default mongoose.model('ChatHistory', chatHistorySchema);