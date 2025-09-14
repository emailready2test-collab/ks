// Chatbot service for managing AI conversations and farming queries
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface ChatMessage {
  _id: string;
  sessionId: string;
  userId: string;
  message: string;
  response: string;
  timestamp: string;
  messageType: 'text' | 'voice' | 'image';
  language: 'en' | 'ml'; // English or Malayalam
  isUser: boolean;
  metadata?: {
    confidence?: number;
    source?: string;
    category?: string;
    entities?: any[];
  };
}

interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  language: 'en' | 'ml';
  isActive: boolean;
}

interface ChatbotResponse {
  message: string;
  confidence: number;
  source: 'knowledgebase' | 'api' | 'nlp' | 'fallback';
  category: string;
  entities: any[];
  suggestions?: string[];
  relatedTopics?: string[];
}

interface VoiceMessage {
  audioUri: string;
  text: string;
  language: 'en' | 'ml';
  duration: number;
}

class ChatbotService {
  private baseURL = `${API_BASE_URL}/chatbot`;
  private currentSessionId: string | null = null;

  // Create a new chat session
  async createSession(language: 'en' | 'ml' = 'en'): Promise<ChatSession> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create chat session');
      }

      this.currentSessionId = data.session._id;
      return data.session;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  // Get user's chat sessions
  async getSessions(): Promise<ChatSession[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get chat sessions');
      }

      return data.sessions;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get session messages');
      }

      return data.messages;
    } catch (error) {
      console.error('Get session messages error:', error);
      throw error;
    }
  }

  // Send a text message
  async sendMessage(message: string, sessionId?: string, language: 'en' | 'ml' = 'en'): Promise<ChatbotResponse> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const currentSession = sessionId || this.currentSessionId;

      if (!currentSession) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseURL}/sessions/${currentSession}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          language,
          messageType: 'text'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data.response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // Send a voice message
  async sendVoiceMessage(voiceMessage: VoiceMessage, sessionId?: string): Promise<ChatbotResponse> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const currentSession = sessionId || this.currentSessionId;

      if (!currentSession) {
        throw new Error('No active session');
      }

      const formData = new FormData();
      formData.append('audio', {
        uri: voiceMessage.audioUri,
        type: 'audio/mp4',
        name: 'voice_message.mp4',
      } as any);
      formData.append('text', voiceMessage.text);
      formData.append('language', voiceMessage.language);
      formData.append('duration', voiceMessage.duration.toString());

      const response = await fetch(`${this.baseURL}/sessions/${currentSession}/voice`, {
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

      return data.response;
    } catch (error) {
      console.error('Send voice message error:', error);
      throw error;
    }
  }

  // Delete a chat session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  // Update session title
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update session title');
      }
    } catch (error) {
      console.error('Update session title error:', error);
      throw error;
    }
  }

  // Get chatbot suggestions
  async getSuggestions(sessionId?: string): Promise<string[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const currentSession = sessionId || this.currentSessionId;

      if (!currentSession) {
        return this.getDefaultSuggestions();
      }

      const response = await fetch(`${this.baseURL}/sessions/${currentSession}/suggestions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get suggestions');
      }

      return data.suggestions;
    } catch (error) {
      console.error('Get suggestions error:', error);
      return this.getDefaultSuggestions();
    }
  }

  // Get default suggestions
  private getDefaultSuggestions(): string[] {
    return [
      'How to prepare soil for rice cultivation?',
      'What are the common diseases in tomato plants?',
      'When is the best time to plant wheat?',
      'How to control pests in brinjal?',
      'What fertilizers are good for coconut trees?',
      'How to improve soil fertility?',
      'What is crop rotation?',
      'How to manage irrigation?',
    ];
  }

  // Mock data for development/testing
  getMockSessions(): ChatSession[] {
    return [
      {
        _id: '1',
        userId: 'user1',
        title: 'Rice Cultivation Help',
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: '2024-02-20T11:30:00Z',
        messageCount: 8,
        lastMessage: 'Thank you for the detailed information!',
        language: 'en',
        isActive: true,
      },
      {
        _id: '2',
        userId: 'user1',
        title: 'Tomato Disease Query',
        createdAt: '2024-02-19T14:20:00Z',
        updatedAt: '2024-02-19T15:45:00Z',
        messageCount: 12,
        lastMessage: 'I will try the organic treatment you suggested.',
        language: 'en',
        isActive: false,
      },
      {
        _id: '3',
        userId: 'user1',
        title: 'വിളകളുടെ രോഗങ്ങൾ',
        createdAt: '2024-02-18T09:15:00Z',
        updatedAt: '2024-02-18T10:30:00Z',
        messageCount: 6,
        lastMessage: 'നന്ദി! വളരെ സഹായകരമായിരുന്നു.',
        language: 'ml',
        isActive: false,
      },
    ];
  }

  getMockMessages(sessionId: string): ChatMessage[] {
    const messages: Record<string, ChatMessage[]> = {
      '1': [
        {
          _id: '1',
          sessionId: '1',
          userId: 'user1',
          message: 'How to prepare soil for rice cultivation?',
          response: 'To prepare soil for rice cultivation, follow these steps:\n\n1. **Land Preparation**: Plow the field 2-3 times to break up clods\n2. **Leveling**: Ensure the field is properly leveled for uniform water distribution\n3. **Puddling**: Create a muddy consistency by working the soil in standing water\n4. **Fertilization**: Apply organic manure and chemical fertilizers as per soil test\n5. **Water Management**: Maintain 2-3 inches of standing water\n\nWould you like more details about any specific step?',
          timestamp: '2024-02-20T10:00:00Z',
          messageType: 'text',
          language: 'en',
          isUser: true,
          metadata: {
            confidence: 0.95,
            source: 'knowledgebase',
            category: 'soil_preparation',
            entities: ['rice', 'soil', 'cultivation']
          }
        },
        {
          _id: '2',
          sessionId: '1',
          userId: 'user1',
          message: 'What about fertilizers?',
          response: 'For rice cultivation, here are the recommended fertilizers:\n\n**Organic Fertilizers:**\n- Farmyard manure: 10-15 tons/hectare\n- Compost: 5-10 tons/hectare\n- Green manure crops\n\n**Chemical Fertilizers:**\n- Nitrogen (N): 120-150 kg/hectare\n- Phosphorus (P2O5): 60-80 kg/hectare\n- Potassium (K2O): 60-80 kg/hectare\n\n**Application Schedule:**\n- Basal dose: 50% N + 100% P + 100% K\n- Top dressing: 25% N at tillering stage\n- Top dressing: 25% N at panicle initiation\n\nAlways get your soil tested for accurate recommendations!',
          timestamp: '2024-02-20T10:05:00Z',
          messageType: 'text',
          language: 'en',
          isUser: true,
          metadata: {
            confidence: 0.92,
            source: 'knowledgebase',
            category: 'fertilization',
            entities: ['fertilizers', 'rice', 'nitrogen', 'phosphorus', 'potassium']
          }
        },
        {
          _id: '3',
          sessionId: '1',
          userId: 'user1',
          message: 'Thank you for the detailed information!',
          response: 'You\'re welcome! I\'m glad I could help with your rice cultivation questions. If you have any more queries about farming, crop management, or need help with other crops, feel free to ask. I\'m here to assist you with all your agricultural needs! 🌾',
          timestamp: '2024-02-20T11:30:00Z',
          messageType: 'text',
          language: 'en',
          isUser: true,
          metadata: {
            confidence: 0.88,
            source: 'nlp',
            category: 'gratitude',
            entities: []
          }
        }
      ],
      '2': [
        {
          _id: '4',
          sessionId: '2',
          userId: 'user1',
          message: 'My tomato plants have yellow leaves with brown spots. What could be the problem?',
          response: 'Based on your description, your tomato plants are likely affected by **Early Blight** or **Septoria Leaf Spot**. Here\'s how to identify and treat:\n\n**Symptoms:**\n- Yellow leaves with brown/black spots\n- Spots may have concentric rings\n- Leaves eventually turn brown and fall off\n\n**Treatment:**\n1. **Organic**: Spray with copper fungicide or neem oil\n2. **Cultural**: Remove affected leaves, improve air circulation\n3. **Prevention**: Avoid overhead watering, use mulch\n\n**Chemical Treatment**:\n- Chlorothalonil or Mancozeb fungicides\n- Apply every 7-10 days\n\nWould you like specific application instructions?',
          timestamp: '2024-02-19T14:20:00Z',
          messageType: 'text',
          language: 'en',
          isUser: true,
          metadata: {
            confidence: 0.94,
            source: 'knowledgebase',
            category: 'disease_identification',
            entities: ['tomato', 'early_blight', 'septoria', 'fungicide']
          }
        }
      ],
      '3': [
        {
          _id: '5',
          sessionId: '3',
          userId: 'user1',
          message: 'വിളകളുടെ രോഗങ്ങൾ എങ്ങനെ തിരിച്ചറിയാം?',
          response: 'വിളകളുടെ രോഗങ്ങൾ തിരിച്ചറിയാൻ ഈ ഘട്ടങ്ങൾ പാലിക്കുക:\n\n**രോഗ ലക്ഷണങ്ങൾ:**\n- ഇലകളിൽ മഞ്ഞ നിറം\n- കറുത്ത അല്ലെങ്കിൽ തവിട്ട് പുള്ളികൾ\n- ഇലകൾ ഉണങ്ങി വീഴുക\n- വളർച്ച കുറയുക\n\n**പ്രതിവിധി:**\n1. **ജൈവ**: നീം എണ്ണ അല്ലെങ്കിൽ കോപ്പർ ഫംഗിസൈഡ്\n2. **സാംസ്കാരിക**: രോഗബാധിത ഇലകൾ നീക്കം ചെയ്യുക\n3. **തടയൽ**: ശരിയായ ജലനിർവഹണം, വായു ചക്രവാളം\n\nകൂടുതൽ വിവരങ്ങൾ വേണമെങ്കിൽ ചോദിക്കുക!',
          timestamp: '2024-02-18T09:15:00Z',
          messageType: 'text',
          language: 'ml',
          isUser: true,
          metadata: {
            confidence: 0.91,
            source: 'knowledgebase',
            category: 'disease_identification',
            entities: ['വിളകൾ', 'രോഗങ്ങൾ', 'ജൈവ_പ്രതിവിധി']
          }
        }
      ]
    };

    return messages[sessionId] || [];
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // Set current session ID
  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  // Clear current session
  clearCurrentSession(): void {
    this.currentSessionId = null;
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage, ChatSession, ChatbotResponse, VoiceMessage };
