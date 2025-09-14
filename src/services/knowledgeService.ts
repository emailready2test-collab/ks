// Knowledge service for knowledge base functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class KnowledgeService {
  private baseURL = `${API_BASE_URL}/knowledge`;

  async getKnowledgeItems(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get knowledge items');
      }

      return data;
    } catch (error) {
      console.error('Get knowledge items error:', error);
      throw error;
    }
  }

  async getKnowledgeItem(itemId: string) {
    try {
      const response = await fetch(`${this.baseURL}/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get knowledge item');
      }

      return data;
    } catch (error) {
      console.error('Get knowledge item error:', error);
      throw error;
    }
  }

  async searchKnowledge(query: string, params: any = {}) {
    try {
      const searchParams = { ...params, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`${this.baseURL}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search knowledge');
      }

      return data;
    } catch (error) {
      console.error('Search knowledge error:', error);
      throw error;
    }
  }

  async getKnowledgeCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get categories');
      }

      return data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async getFeaturedKnowledge() {
    try {
      const response = await fetch(`${this.baseURL}/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get featured knowledge');
      }

      return data;
    } catch (error) {
      console.error('Get featured knowledge error:', error);
      throw error;
    }
  }

  async likeKnowledgeItem(itemId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to like knowledge item');
      }

      return data;
    } catch (error) {
      console.error('Like knowledge item error:', error);
      throw error;
    }
  }

  async addKnowledgeItem(itemData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add knowledge item');
      }

      return data;
    } catch (error) {
      console.error('Add knowledge item error:', error);
      throw error;
    }
  }

  async updateKnowledgeItem(itemId: string, updateData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update knowledge item');
      }

      return data;
    } catch (error) {
      console.error('Update knowledge item error:', error);
      throw error;
    }
  }

  async deleteKnowledgeItem(itemId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete knowledge item');
      }

      return data;
    } catch (error) {
      console.error('Delete knowledge item error:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockKnowledgeItems() {
    return [
      {
        _id: '1',
        title: 'Rice Cultivation Guide',
        description: 'Complete guide for rice cultivation including soil preparation, planting, and harvesting techniques.',
        content: 'Rice cultivation requires proper water management, soil preparation, and timely planting. In India, the best time to plant rice is during the monsoon season (June-July). Ensure proper irrigation and use certified seeds for better yield.',
        category: 'crop_guide',
        tags: ['rice', 'cultivation', 'monsoon', 'irrigation'],
        views: 1250,
        likes: 89,
        author: 'Agricultural Expert',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: '2',
        title: 'Common Rice Diseases and Treatment',
        description: 'Identification and treatment of common rice diseases including blast, sheath blight, and bacterial leaf blight.',
        content: 'Rice blast is one of the most destructive diseases of rice. Symptoms include diamond-shaped lesions on leaves. Treatment includes fungicide application and resistant varieties.',
        category: 'diseases',
        tags: ['rice', 'diseases', 'blast', 'fungicide'],
        views: 890,
        likes: 67,
        author: 'Plant Pathologist',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        _id: '3',
        title: 'Soil Testing and Nutrient Management',
        description: 'How to test soil and manage nutrients for optimal crop growth.',
        content: 'Soil testing helps determine nutrient levels and pH. Regular testing every 2-3 years is recommended. Based on results, apply appropriate fertilizers.',
        category: 'soil_irrigation',
        tags: ['soil', 'testing', 'nutrients', 'fertilizer'],
        views: 756,
        likes: 45,
        author: 'Soil Scientist',
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-08T10:00:00Z'
      },
      {
        _id: '4',
        title: 'Integrated Pest Management',
        description: 'Environmentally friendly approach to pest control using biological, cultural, and chemical methods.',
        content: 'IPM combines multiple pest control methods to minimize environmental impact. Use resistant varieties, biological control, and chemical pesticides as last resort.',
        category: 'pest_control',
        tags: ['pest', 'management', 'biological', 'control'],
        views: 634,
        likes: 52,
        author: 'Entomologist',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z'
      },
      {
        _id: '5',
        title: 'Organic Fertilizer Preparation',
        description: 'How to prepare and use organic fertilizers like compost, vermicompost, and green manure.',
        content: 'Organic fertilizers improve soil health and provide nutrients slowly. Compost can be made from farm waste, kitchen waste, and animal manure.',
        category: 'fertilizers',
        tags: ['organic', 'fertilizer', 'compost', 'vermicompost'],
        views: 567,
        likes: 38,
        author: 'Organic Farming Expert',
        createdAt: '2024-01-03T10:00:00Z',
        updatedAt: '2024-01-03T10:00:00Z'
      },
      {
        _id: '6',
        title: 'Weather-Based Farming Decisions',
        description: 'How to use weather forecasts to make better farming decisions.',
        content: 'Weather forecasts help plan irrigation, pest control, and harvesting. Monitor rainfall, temperature, and humidity for optimal crop management.',
        category: 'weather',
        tags: ['weather', 'forecast', 'irrigation', 'planning'],
        views: 445,
        likes: 29,
        author: 'Meteorologist',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        _id: '7',
        title: 'Market Price Analysis and Selling Strategies',
        description: 'Understanding market trends and strategies for better crop selling.',
        content: 'Monitor market prices regularly. Sell during peak demand periods. Consider storage options for better prices. Use government procurement schemes.',
        category: 'market',
        tags: ['market', 'price', 'selling', 'storage'],
        views: 389,
        likes: 24,
        author: 'Market Analyst',
        createdAt: '2023-12-28T10:00:00Z',
        updatedAt: '2023-12-28T10:00:00Z'
      },
      {
        _id: '8',
        title: 'Drip Irrigation System Setup',
        description: 'Complete guide to setting up and maintaining drip irrigation systems.',
        content: 'Drip irrigation saves water and improves crop yield. Install proper filters, pressure regulators, and emitters. Regular maintenance is essential.',
        category: 'soil_irrigation',
        tags: ['drip', 'irrigation', 'water', 'conservation'],
        views: 678,
        likes: 41,
        author: 'Irrigation Engineer',
        createdAt: '2023-12-25T10:00:00Z',
        updatedAt: '2023-12-25T10:00:00Z'
      }
    ];
  }
}

export const knowledgeService = new KnowledgeService();
