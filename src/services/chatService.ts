// Chat service for chatbot functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class ChatService {
  private baseURL = `${API_BASE_URL}/chat`;

  async getChatHistory(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get chat history');
      }

      return data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  async getSession(sessionId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get chat session');
      }

      return data;
    } catch (error) {
      console.error('Get chat session error:', error);
      throw error;
    }
  }

  async startSession(initialMessage?: string, language: string = 'en') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialMessage,
          language
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start chat session');
      }

      return data;
    } catch (error) {
      console.error('Start chat session error:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, message: string, messageType: string = 'text', language: string = 'en') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message,
          messageType,
          language
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async endSession(sessionId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to end chat session');
      }

      return data;
    } catch (error) {
      console.error('End chat session error:', error);
      throw error;
    }
  }

  async addSatisfactionRating(sessionId: string, rating: number, feedback: string = '') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}/rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add satisfaction rating');
      }

      return data;
    } catch (error) {
      console.error('Add satisfaction rating error:', error);
      throw error;
    }
  }

  async archiveSession(sessionId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to archive chat session');
      }

      return data;
    } catch (error) {
      console.error('Archive chat session error:', error);
      throw error;
    }
  }

  async getChatStatistics(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/stats/summary?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get chat statistics');
      }

      return data;
    } catch (error) {
      console.error('Get chat statistics error:', error);
      throw error;
    }
  }

  async getQuickResponses(language: string = 'en', category?: string) {
    try {
      const params = new URLSearchParams({ language });
      if (category) params.append('category', category);
      
      const response = await fetch(`${this.baseURL}/quick-responses?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get quick responses');
      }

      return data;
    } catch (error) {
      console.error('Get quick responses error:', error);
      throw error;
    }
  }

  // Voice message support (for future implementation)
  async sendVoiceMessage(sessionId: string, audioData: any, language: string = 'en') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('audio', audioData);
      formData.append('language', language);
      
      const response = await fetch(`${this.baseURL}/voice-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send voice message');
      }

      return data;
    } catch (error) {
      console.error('Send voice message error:', error);
      throw error;
    }
  }

  // Search chat history
  async searchChatHistory(query: string, params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const searchParams = { ...params, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`${this.baseURL}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search chat history');
      }

      return data;
    } catch (error) {
      console.error('Search chat history error:', error);
      throw error;
    }
  }

  // Export chat history
  async exportChatHistory(sessionId: string, format: string = 'json') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to export chat history');
      }

      return data;
    } catch (error) {
      console.error('Export chat history error:', error);
      throw error;
    }
  }

  // Get chat suggestions based on context
  async getChatSuggestions(sessionId: string, context: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/session/${sessionId}/suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get chat suggestions');
      }

      return data;
    } catch (error) {
      console.error('Get chat suggestions error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
