import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
});

// AI service for disease detection and chat processing
export const analyzeDiseaseImage = async (imagePath, cropInfo) => {
  try {
    const startTime = Date.now();
    
    // In production, integrate with TensorFlow.js or PyTorch API
    // For now, we'll simulate AI analysis with mock data
    
    const mockAnalysis = {
      diseaseDetected: Math.random() > 0.3, // 70% chance of detecting disease
      diseaseName: getRandomDisease(),
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100% confidence
      symptoms: getRandomSymptoms(),
      severity: getRandomSeverity(),
      affectedArea: Math.floor(Math.random() * 50) + 10, // 10-60% affected
      processingTime: Date.now() - startTime
    };

    // Add treatment recommendations
    mockAnalysis.treatment = generateTreatmentRecommendations(mockAnalysis.diseaseName);

    return mockAnalysis;
    
    // TODO: Replace with actual AI model integration
    /*
    const tf = require('@tensorflow/tfjs-node');
    const model = await tf.loadLayersModel('path/to/disease-detection-model');
    
    // Preprocess image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const normalized = resized.div(255.0);
    const batched = normalized.expandDims(0);
    
    // Make prediction
    const predictions = model.predict(batched);
    const results = await predictions.data();
    
    // Process results
    const diseaseIndex = results.indexOf(Math.max(...results));
    const confidence = Math.max(...results) * 100;
    
    return {
      diseaseDetected: confidence > 60,
      diseaseName: diseaseNames[diseaseIndex],
      confidence: confidence,
      symptoms: getSymptomsForDisease(diseaseNames[diseaseIndex]),
      severity: getSeverityFromConfidence(confidence),
      affectedArea: estimateAffectedArea(imageTensor),
      processingTime: Date.now() - startTime
    };
    */
    
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

// Process chat message with AI
export const processChatMessage = async (message, context) => {
  try {
    const startTime = Date.now();
    
    // Determine if it's a farming-related query
    const isFarmingQuery = isFarmingRelated(message);
    
    let response;
    
    if (isFarmingQuery) {
      // Use farming knowledge base + AI
      response = await processFarmingQuery(message, context);
    } else {
      // Use general AI for non-farming queries
      response = await processGeneralQuery(message, context);
    }
    
    return {
      text: response.text,
      model: response.model || 'gpt-3.5-turbo',
      processingTime: Date.now() - startTime,
      sources: response.sources || [],
      actions: response.actions || [],
      confidence: response.confidence || 85
    };
    
  } catch (error) {
    console.error('Chat processing error:', error);
    throw new Error('Failed to process message. Please try again.');
  }
};

// Check if message is farming-related
const isFarmingRelated = (message) => {
  const farmingKeywords = [
    'crop', 'plant', 'seed', 'soil', 'fertilizer', 'pesticide', 'irrigation',
    'harvest', 'yield', 'disease', 'pest', 'weather', 'rain', 'drought',
    'farm', 'agriculture', 'farmer', 'cultivation', 'sowing', 'planting',
    'rice', 'wheat', 'corn', 'vegetable', 'fruit', 'tree', 'flower',
    'organic', 'chemical', 'compost', 'manure', 'watering', 'pruning',
    'market', 'price', 'selling', 'buying', 'scheme', 'subsidy', 'loan'
  ];
  
  const lowerMessage = message.toLowerCase();
  return farmingKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Process farming-related queries
const processFarmingQuery = async (message, context) => {
  try {
    // First, try to get information from knowledge base
    const knowledgeBaseResponse = await searchKnowledgeBase(message);
    
    if (knowledgeBaseResponse.found) {
      return {
        text: knowledgeBaseResponse.answer,
        sources: knowledgeBaseResponse.sources,
        model: 'knowledge-base'
      };
    }
    
    // If not found in knowledge base, use AI with farming context
    const farmingContext = `
      You are Krishi Sakhi, an AI assistant for Indian farmers. 
      Provide helpful, accurate, and practical advice about farming, crops, diseases, weather, and agriculture.
      Always consider Indian farming conditions, climate, and practices.
      If you don't know something, say so and suggest consulting local agricultural experts.
      
      User's farm details: ${JSON.stringify(context.userContext?.userPreferences || {})}
      Current topic: ${context.userContext?.currentTopic || 'general'}
      
      Question: ${message}
    `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: farmingContext },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return {
      text: completion.choices[0].message.content,
      model: 'gpt-3.5-turbo',
      sources: ['AI Knowledge Base']
    };
    
  } catch (error) {
    console.error('Farming query processing error:', error);
    
    // Fallback to basic response
    return {
      text: "I understand you're asking about farming. I'm having trouble processing your request right now. Please try again or contact our support team.",
      model: 'fallback'
    };
  }
};

// Process general queries
const processGeneralQuery = async (message, context) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are Krishi Sakhi, a helpful AI assistant. Provide accurate and helpful responses to user questions.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    return {
      text: completion.choices[0].message.content,
      model: 'gpt-3.5-turbo'
    };
    
  } catch (error) {
    console.error('General query processing error:', error);
    
    return {
      text: "I'm having trouble processing your request right now. Please try again later.",
      model: 'fallback'
    };
  }
};

// Search knowledge base
const searchKnowledgeBase = async (query) => {
  try {
    // In production, integrate with vector database or search engine
    // For now, return mock data
    
    const knowledgeBase = {
      'rice cultivation': {
        answer: 'Rice cultivation requires proper water management, soil preparation, and timely planting. In India, the best time to plant rice is during the monsoon season (June-July). Ensure proper irrigation and use certified seeds for better yield.',
        sources: ['Agricultural Extension Services', 'ICAR Guidelines']
      },
      'tomato diseases': {
        answer: 'Common tomato diseases include early blight, late blight, and bacterial wilt. Use disease-resistant varieties, practice crop rotation, and apply appropriate fungicides. Ensure proper spacing and ventilation.',
        sources: ['Plant Pathology Department', 'Horticulture Board']
      },
      'weather forecast': {
        answer: 'For accurate weather forecasts, check IMD (India Meteorological Department) website or mobile app. Local weather stations provide more precise information for your area.',
        sources: ['IMD', 'Local Weather Station']
      }
    };
    
    const lowerQuery = query.toLowerCase();
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(key)) {
        return {
          found: true,
          answer: value.answer,
          sources: value.sources
        };
      }
    }
    
    return { found: false };
    
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return { found: false };
  }
};

// Helper functions for mock data
const getRandomDisease = () => {
  const diseases = [
    'Leaf Blight', 'Powdery Mildew', 'Rust', 'Anthracnose', 'Bacterial Spot',
    'Fungal Infection', 'Virus Disease', 'Root Rot', 'Wilt Disease', 'Mosaic Virus'
  ];
  return diseases[Math.floor(Math.random() * diseases.length)];
};

const getRandomSymptoms = () => {
  const symptoms = [
    'Yellow spots on leaves', 'White powdery coating', 'Brown lesions',
    'Wilting leaves', 'Stunted growth', 'Leaf curling', 'Black spots',
    'Yellowing of leaves', 'Premature leaf drop', 'Fruit rot'
  ];
  return symptoms.slice(0, Math.floor(Math.random() * 3) + 1);
};

const getRandomSeverity = () => {
  const severities = ['mild', 'moderate', 'severe'];
  return severities[Math.floor(Math.random() * severities.length)];
};

const generateTreatmentRecommendations = (diseaseName) => {
  return {
    organic: [
      {
        name: 'Neem Oil Spray',
        description: 'Apply neem oil solution to affected plants',
        dosage: '2-3ml per liter of water',
        frequency: 'Every 7-10 days',
        duration: '2-3 weeks',
        cost: 150,
        effectiveness: 70
      },
      {
        name: 'Baking Soda Solution',
        description: 'Spray baking soda solution on leaves',
        dosage: '1 teaspoon per liter of water',
        frequency: 'Every 5-7 days',
        duration: '2 weeks',
        cost: 50,
        effectiveness: 60
      }
    ],
    chemical: [
      {
        name: 'Copper Fungicide',
        description: 'Apply copper-based fungicide',
        dosage: 'As per manufacturer instructions',
        frequency: 'Every 10-14 days',
        duration: '3-4 weeks',
        cost: 300,
        effectiveness: 85,
        safetyPrecautions: ['Wear protective clothing', 'Avoid contact with skin', 'Keep away from children']
      }
    ],
    preventive: [
      {
        measure: 'Crop Rotation',
        description: 'Rotate crops to prevent disease buildup',
        frequency: 'Every season',
        cost: 0
      },
      {
        measure: 'Proper Spacing',
        description: 'Maintain adequate spacing between plants',
        frequency: 'During planting',
        cost: 0
      }
    ]
  };
};

// Get weather data
export const getWeatherData = async (latitude, longitude) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || 'your-openweather-api-key';
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    
    return {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      condition: response.data.weather[0].description,
      windSpeed: response.data.wind.speed,
      rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0
    };
    
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('Failed to fetch weather data');
  }
};

// Get market prices
export const getMarketPrices = async (cropName, location) => {
  try {
    // In production, integrate with Agmarknet API or eNAM
    // For now, return mock data
    
    const mockPrices = {
      'rice': { min: 25, max: 35, average: 30 },
      'wheat': { min: 20, max: 28, average: 24 },
      'tomato': { min: 15, max: 45, average: 30 },
      'onion': { min: 20, max: 40, average: 30 },
      'potato': { min: 12, max: 25, average: 18 }
    };
    
    return mockPrices[cropName.toLowerCase()] || { min: 10, max: 20, average: 15 };
    
  } catch (error) {
    console.error('Market price API error:', error);
    throw new Error('Failed to fetch market prices');
  }
};
