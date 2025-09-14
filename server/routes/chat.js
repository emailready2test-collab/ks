import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validationService } from '../utils/validation.js';
import { errorService } from '../utils/errorService.js';
import { processChatMessage } from '../utils/chat.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get chat history for a farmer
router.get('/history', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      sessionId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { farmerId };
    
    if (sessionId) filter.sessionId = sessionId;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const chatHistories = await ChatHistory.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerId', 'name phone')
      .lean();

    const total = await ChatHistory.countDocuments(filter);

    res.json({
      success: true,
      data: {
        chatHistories,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    const appError = errorService.handleApiError(error, 'getChatHistory');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get single chat session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const farmerId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ 
      sessionId: sessionId, 
      farmerId 
    }).populate('farmerId', 'name phone');

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: { chatHistory }
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    const appError = errorService.handleApiError(error, 'getChatSession');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Start new chat session
router.post('/session/start', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { initialMessage, language = 'en' } = req.body;

    // Create new session
    const sessionId = uuidv4();
    const chatHistory = new ChatHistory({
      farmerId,
      sessionId,
      context: {
        currentTopic: '',
        previousTopics: [],
        userPreferences: {
          language: language,
          expertise: req.user.role,
          farmType: req.user.farmDetails?.farmSize ? 'commercial' : 'small'
        },
        sessionData: {}
      },
      duration: {
        startTime: new Date()
      }
    });

    await chatHistory.save();

    // Add initial message if provided
    if (initialMessage) {
      await chatHistory.addMessage('user', {
        text: initialMessage,
        type: 'text',
        language: language
      });

      // Process the message
      try {
        const response = await processChatMessage(initialMessage, {
          farmerId,
          sessionId,
          language,
          userContext: chatHistory.context
        });

        await chatHistory.addMessage('assistant', {
          text: response.text,
          type: 'text',
          language: language
        }, {
          model: response.model,
          processingTime: response.processingTime,
          sources: response.sources,
          actions: response.actions
        });
      } catch (chatError) {
        console.error('Chat processing error:', chatError);
        await chatHistory.addMessage('assistant', {
          text: 'I apologize, but I encountered an error processing your message. Please try again.',
          type: 'text',
          language: language
        }, {
          error: chatError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Chat session started successfully',
      data: { 
        sessionId,
        chatHistory 
      }
    });

  } catch (error) {
    console.error('Start chat session error:', error);
    const appError = errorService.handleApiError(error, 'startChatSession');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Send message to chat
router.post('/message', auth, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { sessionId, message, messageType = 'text', language = 'en' } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    const chatHistory = await ChatHistory.findOne({ 
      sessionId: sessionId, 
      farmerId 
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (chatHistory.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to archived session'
      });
    }

    // Add user message
    await chatHistory.addMessage('user', {
      text: message,
      type: messageType,
      language: language
    });

    // Process the message
    try {
      const response = await processChatMessage(message, {
        farmerId,
        sessionId,
        language,
        userContext: chatHistory.context,
        messageType
      });

      // Add assistant response
      await chatHistory.addMessage('assistant', {
        text: response.text,
        type: 'text',
        language: language
      }, {
        model: response.model,
        processingTime: response.processingTime,
        sources: response.sources,
        actions: response.actions,
        confidence: response.confidence
      });

      res.json({
        success: true,
        message: 'Message processed successfully',
        data: { 
          response: response.text,
          sources: response.sources,
          actions: response.actions,
          chatHistory 
        }
      });

    } catch (chatError) {
      console.error('Chat processing error:', chatError);
      
      // Add error response
      await chatHistory.addMessage('assistant', {
        text: 'I apologize, but I encountered an error processing your message. Please try again.',
        type: 'text',
        language: language
      }, {
        error: chatError.message
      });

      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        data: { 
          response: 'I apologize, but I encountered an error processing your message. Please try again.',
          chatHistory 
        }
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    const appError = errorService.handleApiError(error, 'sendMessage');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// End chat session
router.post('/session/:sessionId/end', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const farmerId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ 
      sessionId: sessionId, 
      farmerId 
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await chatHistory.endSession();

    res.json({
      success: true,
      message: 'Chat session ended successfully',
      data: { chatHistory }
    });

  } catch (error) {
    console.error('End chat session error:', error);
    const appError = errorService.handleApiError(error, 'endChatSession');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Add satisfaction rating
router.post('/session/:sessionId/rating', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const farmerId = req.user.id;
    const { rating, feedback = '' } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const chatHistory = await ChatHistory.findOne({ 
      sessionId: sessionId, 
      farmerId 
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await chatHistory.addSatisfactionRating(rating, feedback);

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: { chatHistory }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    const appError = errorService.handleApiError(error, 'addRating');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Archive chat session
router.post('/session/:sessionId/archive', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const farmerId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ 
      sessionId: sessionId, 
      farmerId 
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await chatHistory.archiveSession();

    res.json({
      success: true,
      message: 'Chat session archived successfully',
      data: { chatHistory }
    });

  } catch (error) {
    console.error('Archive chat session error:', error);
    const appError = errorService.handleApiError(error, 'archiveChatSession');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get chat statistics
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

    const stats = await ChatHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: { $size: '$messages' } },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          archivedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          averageRating: { $avg: '$satisfaction.rating' },
          totalDuration: { $sum: '$duration.totalMinutes' },
          topics: {
            $push: '$context.previousTopics'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalMessages: 0,
      completedSessions: 0,
      activeSessions: 0,
      archivedSessions: 0,
      averageRating: 0,
      totalDuration: 0,
      topics: []
    };

    // Calculate topic frequency
    const topicFrequency = {};
    result.topics.forEach(topicArray => {
      topicArray.forEach(topic => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSessions: result.totalSessions,
          totalMessages: result.totalMessages,
          completedSessions: result.completedSessions,
          activeSessions: result.activeSessions,
          archivedSessions: result.archivedSessions,
          averageRating: Math.round(result.averageRating * 10) / 10,
          totalDuration: result.totalDuration,
          averageSessionDuration: result.totalSessions > 0 
            ? Math.round(result.totalDuration / result.totalSessions) 
            : 0
        },
        topicFrequency
      }
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    const appError = errorService.handleApiError(error, 'getChatStats');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

// Get quick responses (common questions)
router.get('/quick-responses', auth, async (req, res) => {
  try {
    const { language = 'en', category } = req.query;

    const quickResponses = {
      en: {
        general: [
          "What's the weather forecast for today?",
          "Show me market prices for vegetables",
          "How to prepare soil for planting?",
          "What are the latest government schemes?"
        ],
        crop_disease: [
          "My crop has yellow spots on leaves",
          "How to treat fungal infections?",
          "What causes wilting in plants?",
          "How to prevent pest attacks?"
        ],
        fertilizer: [
          "When to apply nitrogen fertilizer?",
          "What's the best organic fertilizer?",
          "How much fertilizer per acre?",
          "NPK ratio for rice cultivation"
        ],
        irrigation: [
          "How often to water vegetables?",
          "Best irrigation method for rice?",
          "Water requirements for different crops",
          "How to check soil moisture?"
        ]
      },
      hi: {
        general: [
          "आज का मौसम कैसा है?",
          "सब्जियों की बाजार कीमतें दिखाएं",
          "बुवाई के लिए मिट्टी कैसे तैयार करें?",
          "नवीनतम सरकारी योजनाएं क्या हैं?"
        ],
        crop_disease: [
          "मेरी फसल की पत्तियों पर पीले धब्बे हैं",
          "फंगल संक्रमण का इलाज कैसे करें?",
          "पौधों में मुरझाने का कारण क्या है?",
          "कीट हमलों से कैसे बचें?"
        ]
      },
      ml: {
        general: [
          "ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?",
          "പച്ചക്കറികളുടെ വിപണി വിലകൾ കാണിക്കുക",
          "വിത്തിടാനായി മണ്ണ് എങ്ങനെ തയ്യാറാക്കാം?",
          "ഏറ്റവും പുതിയ സർക്കാർ പദ്ധതികൾ എന്തൊക്കെയാണ്?"
        ],
        crop_disease: [
          "എന്റെ വിളയുടെ ഇലകളിൽ മഞ്ഞ പുള്ളികൾ ഉണ്ട്",
          "ഫംഗൽ അണുബാധയുടെ ചികിത്സ എങ്ങനെ?",
          "ചെടികളിൽ വാട്ടം വരുന്നതിന്റെ കാരണം എന്താണ്?",
          "കീട ആക്രമണങ്ങളിൽ നിന്ന് എങ്ങനെ സംരക്ഷിക്കാം?"
        ]
      }
    };

    const responses = quickResponses[language] || quickResponses.en;
    const categoryResponses = category ? responses[category] : Object.values(responses).flat();

    res.json({
      success: true,
      data: { quickResponses: categoryResponses }
    });

  } catch (error) {
    console.error('Get quick responses error:', error);
    const appError = errorService.handleApiError(error, 'getQuickResponses');
    res.status(500).json({
      success: false,
      message: errorService.getUserFriendlyMessage(appError)
    });
  }
});

export default router;