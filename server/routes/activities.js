import express from 'express';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validationService } from '../utils/validation.js';
import { errorService } from '../utils/errorService.js';

const router = express.Router();

// Get all activities for a farmer
router.get('/', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      cropName, 
      status, 
      priority,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { farmerId };
    
    if (type) filter.type = type;
    if (cropName) filter.cropName = new RegExp(cropName, 'i');
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const activities = await Activity.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerId', 'name phone')
      .lean();

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    const appError = errorService.handleApiError(error, 'getActivities');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get single activity
router.get('/:id', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;

    const activity = await Activity.findOne({ _id: activityId, farmerId })
      .populate('farmerId', 'name phone')
      .populate('relatedActivities');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: { activity }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    const appError = errorService.handleApiError(error, 'getActivity');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Create new activity
router.post('/', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const activityData = { ...req.body, farmerId };

    // Validate activity data
    const validation = validationService.validateActivity(activityData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const activity = new Activity(activityData);
    await activity.save();

    // Update user statistics
    await User.findByIdAndUpdate(farmerId, {
      $inc: { 'statistics.totalActivities': 1 }
    });

    // Populate the activity for response
    await activity.populate('farmerId', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Create activity error:', error);
    const appError = errorService.handleApiError(error, 'createActivity');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Update activity
router.put('/:id', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.farmerId;
    delete updates._id;

    const activity = await Activity.findOneAndUpdate(
      { _id: activityId, farmerId },
      updates,
      { new: true, runValidators: true }
    ).populate('farmerId', 'name phone');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Update activity error:', error);
    const appError = errorService.handleApiError(error, 'updateActivity');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Delete activity
router.delete('/:id', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;

    const activity = await Activity.findOneAndDelete({ _id: activityId, farmerId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Update user statistics
    await User.findByIdAndUpdate(farmerId, {
      $inc: { 'statistics.totalActivities': -1 }
    });

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    const appError = errorService.handleApiError(error, 'deleteActivity');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Mark activity as completed
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;

    const activity = await Activity.findOne({ _id: activityId, farmerId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.markCompleted();

    res.json({
      success: true,
      message: 'Activity marked as completed',
      data: { activity }
    });

  } catch (error) {
    console.error('Complete activity error:', error);
    const appError = errorService.handleApiError(error, 'completeActivity');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Update activity progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;
    const { percentage } = req.body;

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress percentage must be between 0 and 100'
      });
    }

    const activity = await Activity.findOne({ _id: activityId, farmerId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.updateProgress(percentage);

    res.json({
      success: true,
      message: 'Activity progress updated',
      data: { activity }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    const appError = errorService.handleApiError(error, 'updateProgress');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Add reminder to activity
router.patch('/:id/reminder', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const farmerId = req.user.id;
    const { date, message } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Reminder date is required'
      });
    }

    const activity = await Activity.findOne({ _id: activityId, farmerId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.addReminder(new Date(date), message);

    res.json({
      success: true,
      message: 'Reminder added successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Add reminder error:', error);
    const appError = errorService.handleApiError(error, 'addReminder');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get activity statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { startDate, endDate } = req.query;

    const filter = { farmerId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const stats = await Activity.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalCost: { $sum: '$cost' },
          completedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          activitiesByType: {
            $push: {
              type: '$type',
              cost: '$cost',
              status: '$status'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalActivities: 0,
      totalCost: 0,
      completedActivities: 0,
      pendingActivities: 0,
      inProgressActivities: 0,
      activitiesByType: []
    };

    // Calculate type-wise statistics
    const typeStats = {};
    result.activitiesByType.forEach(activity => {
      if (!typeStats[activity.type]) {
        typeStats[activity.type] = {
          count: 0,
          totalCost: 0,
          completed: 0
        };
      }
      typeStats[activity.type].count += 1;
      typeStats[activity.type].totalCost += activity.cost || 0;
      if (activity.status === 'completed') {
        typeStats[activity.type].completed += 1;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalActivities: result.totalActivities,
          totalCost: result.totalCost,
          completedActivities: result.completedActivities,
          pendingActivities: result.pendingActivities,
          inProgressActivities: result.inProgressActivities,
          completionRate: result.totalActivities > 0 
            ? Math.round((result.completedActivities / result.totalActivities) * 100) 
            : 0
        },
        typeStats
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    const appError = errorService.handleApiError(error, 'getActivityStats');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

export default router;