import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { validationService } from '../utils/validation.js';
import { errorService } from '../utils/errorService.js';

const router = express.Router();

// Get all posts (public endpoint with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      cropName, 
      tags,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isDeleted: false };
    
    if (category) filter.category = category;
    if (cropName) filter['cropRelated.cropName'] = new RegExp(cropName, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    if (location) filter['location.district'] = new RegExp(location, 'i');

    // Build sort object
    const sort = {};
    if (sortBy === 'popular') {
      sort.likeCount = -1;
      sort.createdAt = -1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const posts = await Post.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'name profileImage role')
      .populate('likes.user', 'name')
      .populate('dislikes.user', 'name')
      .populate('replies.author', 'name profileImage')
      .lean();

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    const appError = errorService.handleApiError(error, 'getPosts');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId, isDeleted: false })
      .populate('author', 'name profileImage role')
      .populate('likes.user', 'name')
      .populate('dislikes.user', 'name')
      .populate('replies.author', 'name profileImage')
      .populate('replies.likes.user', 'name')
      .populate('replies.dislikes.user', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { post }
    });

  } catch (error) {
    console.error('Get post error:', error);
    const appError = errorService.handleApiError(error, 'getPost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const authorId = req.user.id;
    const postData = { ...req.body, author: authorId };

    // Validate post data
    const validation = validationService.validatePost(postData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const post = new Post(postData);
    await post.save();

    // Update user statistics
    await User.findByIdAndUpdate(authorId, {
      $inc: { 'statistics.totalPosts': 1 }
    });

    // Populate the post for response
    await post.populate('author', 'name profileImage role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Create post error:', error);
    const appError = errorService.handleApiError(error, 'createPost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.author;
    delete updates._id;
    delete updates.likes;
    delete updates.dislikes;
    delete updates.replies;
    delete updates.views;

    const post = await Post.findOneAndUpdate(
      { _id: postId, author: userId, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name profileImage role');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to edit it'
      });
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Update post error:', error);
    const appError = errorService.handleApiError(error, 'updatePost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOneAndUpdate(
      { _id: postId, author: userId, isDeleted: false },
      { 
        isDeleted: true, 
        deletedAt: new Date(), 
        deletedBy: userId 
      }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to delete it'
      });
    }

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: { 'statistics.totalPosts': -1 }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    const appError = errorService.handleApiError(error, 'deletePost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addLike(userId);

    res.json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount
      }
    });

  } catch (error) {
    console.error('Like post error:', error);
    const appError = errorService.handleApiError(error, 'likePost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Dislike/Undislike post
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addDislike(userId);

    res.json({
      success: true,
      message: 'Post disliked successfully',
      data: {
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount
      }
    });

  } catch (error) {
    console.error('Dislike post error:', error);
    const appError = errorService.handleApiError(error, 'dislikePost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Remove reaction from post
router.delete('/:id/reaction', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeReaction(userId);

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: {
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount
      }
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    const appError = errorService.handleApiError(error, 'removeReaction');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Add reply to post
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content, images = [] } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addReply(userId, content, images);

    // Populate the updated post
    await post.populate('replies.author', 'name profileImage');

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Add reply error:', error);
    const appError = errorService.handleApiError(error, 'addReply');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Delete reply
router.delete('/:id/reply/:replyId', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const replyId = req.params.replyId;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check if user is the author of the reply or the post
    if (!reply.author.equals(userId) && !post.author.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this reply'
      });
    }

    await post.deleteReply(replyId);

    res.json({
      success: true,
      message: 'Reply deleted successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Delete reply error:', error);
    const appError = errorService.handleApiError(error, 'deleteReply');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Report post
router.post('/:id/report', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { reason, description = '' } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.reportPost(userId, reason, description);

    res.json({
      success: true,
      message: 'Post reported successfully'
    });

  } catch (error) {
    console.error('Report post error:', error);
    const appError = errorService.handleApiError(error, 'reportPost');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get trending posts
router.get('/trending/list', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingPosts = await Post.find({ isDeleted: false })
      .sort({ 
        likeCount: -1, 
        replyCount: -1, 
        views: -1,
        createdAt: -1 
      })
      .limit(parseInt(limit))
      .populate('author', 'name profileImage role')
      .lean();

    res.json({
      success: true,
      data: { posts: trendingPosts }
    });

  } catch (error) {
    console.error('Get trending posts error:', error);
    const appError = errorService.handleApiError(error, 'getTrendingPosts');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

export default router;