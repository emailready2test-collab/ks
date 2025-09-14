import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
    trim: true
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  category: {
    type: String,
    enum: [
      'general', 'crop_advice', 'disease_help', 'market_info', 
      'weather_update', 'success_story', 'question', 'announcement'
    ],
    default: 'general'
  },
  tags: [String],
  location: {
    state: String,
    district: String,
    village: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  cropRelated: {
    cropName: String,
    variety: String,
    stage: {
      type: String,
      enum: ['planting', 'growing', 'flowering', 'fruiting', 'harvesting']
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    images: [String],
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    dislikes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'false_info', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expertVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'cropRelated.cropName': 1 });
postSchema.index({ location: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPinned: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for reply count
postSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Method to add like
postSchema.methods.addLike = function(userId) {
  // Remove from dislikes if exists
  this.dislikes = this.dislikes.filter(dislike => !dislike.user.equals(userId));
  
  // Add to likes if not already liked
  const alreadyLiked = this.likes.some(like => like.user.equals(userId));
  if (!alreadyLiked) {
    this.likes.push({ user: userId });
  }
  return this.save();
};

// Method to add dislike
postSchema.methods.addDislike = function(userId) {
  // Remove from likes if exists
  this.likes = this.likes.filter(like => !like.user.equals(userId));
  
  // Add to dislikes if not already disliked
  const alreadyDisliked = this.dislikes.some(dislike => dislike.user.equals(userId));
  if (!alreadyDisliked) {
    this.dislikes.push({ user: userId });
  }
  return this.save();
};

// Method to remove reaction
postSchema.methods.removeReaction = function(userId) {
  this.likes = this.likes.filter(like => !like.user.equals(userId));
  this.dislikes = this.dislikes.filter(dislike => !dislike.user.equals(userId));
  return this.save();
};

// Method to add reply
postSchema.methods.addReply = function(authorId, content, images = []) {
  this.replies.push({
    author: authorId,
    content: content,
    images: images
  });
  return this.save();
};

// Method to delete reply
postSchema.methods.deleteReply = function(replyId) {
  this.replies = this.replies.filter(reply => !reply._id.equals(replyId));
  return this.save();
};

// Method to report post
postSchema.methods.reportPost = function(reporterId, reason, description = '') {
  this.reports.push({
    reporter: reporterId,
    reason: reason,
    description: description
  });
  this.reportCount += 1;
  return this.save();
};

// Method to increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

export default mongoose.model('Post', postSchema);