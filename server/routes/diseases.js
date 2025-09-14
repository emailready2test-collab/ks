import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import DiseaseReport from '../models/DiseaseReport.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validationService } from '../utils/validation.js';
import { errorService } from '../utils/errorService.js';
import { analyzeDiseaseImage } from '../utils/aiService.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/disease-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `disease-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all disease reports for a farmer
router.get('/', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      cropName, 
      diseaseName,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { farmerId };
    
    if (cropName) filter['cropInfo.cropName'] = new RegExp(cropName, 'i');
    if (diseaseName) filter['aiAnalysis.diseaseName'] = new RegExp(diseaseName, 'i');
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await DiseaseReport.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerId', 'name phone')
      .populate('expertReview.reviewedBy', 'name role')
      .lean();

    const total = await DiseaseReport.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get disease reports error:', error);
    const appError = errorService.handleApiError(error, 'getDiseaseReports');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get single disease report
router.get('/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const farmerId = req.user.id;

    const report = await DiseaseReport.findOne({ _id: reportId, farmerId })
      .populate('farmerId', 'name phone')
      .populate('expertReview.reviewedBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Get disease report error:', error);
    const appError = errorService.handleApiError(error, 'getDiseaseReport');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Upload image and analyze disease
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { cropInfo, weather } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Validate crop info
    const validation = validationService.validateCropInfo(cropInfo);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create disease report
    const reportData = {
      farmerId,
      image: {
        url: `/uploads/disease-images/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      cropInfo: JSON.parse(cropInfo),
      weather: weather ? JSON.parse(weather) : {}
    };

    const report = new DiseaseReport(reportData);
    await report.save();

    // Analyze image with AI
    try {
      const analysisResult = await analyzeDiseaseImage(req.file.path, reportData.cropInfo);
      
      report.aiAnalysis = {
        ...analysisResult,
        analysisDate: new Date(),
        modelVersion: '1.0.0',
        processingTime: analysisResult.processingTime || 0
      };

      await report.save();

      // Update user statistics
      await User.findByIdAndUpdate(farmerId, {
        $inc: { 'statistics.totalDiseaseReports': 1 }
      });

      res.status(201).json({
        success: true,
        message: 'Disease analysis completed',
        data: { report }
      });

    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      
      // Save report even if AI analysis fails
      report.aiAnalysis = {
        diseaseDetected: false,
        confidence: 0,
        analysisDate: new Date(),
        modelVersion: '1.0.0',
        processingTime: 0,
        error: 'Analysis failed, please try again'
      };
      
      await report.save();

      res.status(201).json({
        success: true,
        message: 'Image uploaded but analysis failed. Please try again.',
        data: { report }
      });
    }

  } catch (error) {
    console.error('Analyze disease error:', error);
    const appError = errorService.handleApiError(error, 'analyzeDisease');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Update disease report
router.put('/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const farmerId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.farmerId;
    delete updates._id;
    delete updates.image;
    delete updates.aiAnalysis;

    const report = await DiseaseReport.findOneAndUpdate(
      { _id: reportId, farmerId },
      updates,
      { new: true, runValidators: true }
    ).populate('farmerId', 'name phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease report updated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Update disease report error:', error);
    const appError = errorService.handleApiError(error, 'updateDiseaseReport');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Delete disease report
router.delete('/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const farmerId = req.user.id;

    const report = await DiseaseReport.findOneAndDelete({ _id: reportId, farmerId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    // Delete associated image file
    if (report.image && report.image.filename) {
      const imagePath = `uploads/disease-images/${report.image.filename}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Update user statistics
    await User.findByIdAndUpdate(farmerId, {
      $inc: { 'statistics.totalDiseaseReports': -1 }
    });

    res.json({
      success: true,
      message: 'Disease report deleted successfully'
    });

  } catch (error) {
    console.error('Delete disease report error:', error);
    const appError = errorService.handleApiError(error, 'deleteDiseaseReport');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Add expert review
router.post('/:id/expert-review', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const expertId = req.user.id;
    const { diagnosis, treatment, notes, accuracy } = req.body;

    // Check if user is an expert
    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only experts can provide reviews'
      });
    }

    const report = await DiseaseReport.findOne({ _id: reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    await report.addExpertReview(expertId, diagnosis, treatment, notes, accuracy);

    res.json({
      success: true,
      message: 'Expert review added successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Add expert review error:', error);
    const appError = errorService.handleApiError(error, 'addExpertReview');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Schedule follow-up
router.post('/:id/follow-up', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const farmerId = req.user.id;
    const { date, notes } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date is required'
      });
    }

    const report = await DiseaseReport.findOne({ _id: reportId, farmerId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    await report.scheduleFollowUp(new Date(date), notes);

    res.json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Schedule follow-up error:', error);
    const appError = errorService.handleApiError(error, 'scheduleFollowUp');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Add feedback to report
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;
    const { rating, comment, helpful } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const report = await DiseaseReport.findOne({ _id: reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    await report.addFeedback(userId, rating, comment, helpful);

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Add feedback error:', error);
    const appError = errorService.handleApiError(error, 'addFeedback');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get public disease reports (for learning)
router.get('/public/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      cropName, 
      diseaseName,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    
    if (cropName) filter['cropInfo.cropName'] = new RegExp(cropName, 'i');
    if (diseaseName) filter['aiAnalysis.diseaseName'] = new RegExp(diseaseName, 'i');

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await DiseaseReport.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerId', 'name')
      .populate('expertReview.reviewedBy', 'name role')
      .select('-farmerId -expertReview.reviewedBy')
      .lean();

    const total = await DiseaseReport.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get public disease reports error:', error);
    const appError = errorService.handleApiError(error, 'getPublicDiseaseReports');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get disease statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { startDate, endDate } = req.query;

    const filter = { farmerId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await DiseaseReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          diseasesDetected: {
            $sum: { $cond: [{ $eq: ['$aiAnalysis.diseaseDetected', true] }, 1, 0] }
          },
          expertReviewed: {
            $sum: { $cond: [{ $ne: ['$expertReview.reviewedBy', null] }, 1, 0] }
          },
          totalTreatmentCost: { $sum: '$totalTreatmentCost' },
          diseasesByCrop: {
            $push: {
              cropName: '$cropInfo.cropName',
              diseaseName: '$aiAnalysis.diseaseName',
              severity: '$aiAnalysis.severity'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalReports: 0,
      diseasesDetected: 0,
      expertReviewed: 0,
      totalTreatmentCost: 0,
      diseasesByCrop: []
    };

    // Calculate crop-wise statistics
    const cropStats = {};
    result.diseasesByCrop.forEach(report => {
      if (!cropStats[report.cropName]) {
        cropStats[report.cropName] = {
          totalReports: 0,
          diseasesDetected: 0,
          commonDiseases: {}
        };
      }
      cropStats[report.cropName].totalReports += 1;
      if (report.diseaseName) {
        cropStats[report.cropName].diseasesDetected += 1;
        if (!cropStats[report.cropName].commonDiseases[report.diseaseName]) {
          cropStats[report.cropName].commonDiseases[report.diseaseName] = 0;
        }
        cropStats[report.cropName].commonDiseases[report.diseaseName] += 1;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalReports: result.totalReports,
          diseasesDetected: result.diseasesDetected,
          expertReviewed: result.expertReviewed,
          totalTreatmentCost: result.totalTreatmentCost,
          detectionRate: result.totalReports > 0 
            ? Math.round((result.diseasesDetected / result.totalReports) * 100) 
            : 0
        },
        cropStats
      }
    });

  } catch (error) {
    console.error('Get disease stats error:', error);
    const appError = errorService.handleApiError(error, 'getDiseaseStats');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

export default router;