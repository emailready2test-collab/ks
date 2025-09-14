import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatbotService, ChatMessage, ChatSession } from '../services/chatbotService';

interface ChatbotProps {
  navigation: any;
}

const Chatbot: React.FC<ChatbotProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ml'>('en');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadSessions();
    createNewSession();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
      loadSuggestions();
    }
  }, [currentSession]);

  const loadSessions = async () => {
    try {
      // For now, use mock data. In production, use: const data = await chatbotService.getSessions();
      const mockSessions = chatbotService.getMockSessions();
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createNewSession = async () => {
    try {
      // For now, use mock data. In production, use: const session = await chatbotService.createSession(language);
      const mockSession: ChatSession = {
        _id: 'new_session',
        userId: 'user1',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        language,
        isActive: true,
      };
      setCurrentSession(mockSession);
      chatbotService.setCurrentSessionId(mockSession._id);
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create new chat session');
    }
  };

  const loadMessages = async () => {
    if (!currentSession) return;

    try {
      // For now, use mock data. In production, use: const data = await chatbotService.getSessionMessages(currentSession._id);
      const mockMessages = chatbotService.getMockMessages(currentSession._id);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const data = await chatbotService.getSuggestions(currentSession?._id);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions(chatbotService.getDefaultSuggestions());
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentSession) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      _id: `user_${Date.now()}`,
      sessionId: currentSession._id,
      userId: 'user1',
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      language,
      isUser: true,
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // For now, use mock response. In production, use: const response = await chatbotService.sendMessage(userMessage, currentSession._id, language);
      const mockResponse = {
        message: `I understand you're asking about "${userMessage}". This is a mock response. In production, this would be processed by our AI system to provide accurate farming advice based on your query.`,
        confidence: 0.85,
        source: 'nlp' as const,
        category: 'general_query',
        entities: [],
        suggestions: [
          'Tell me more about soil preparation',
          'What are common crop diseases?',
          'How to improve crop yield?',
        ],
      };

      // Add bot response to chat
      const botMessage: ChatMessage = {
        _id: `bot_${Date.now()}`,
        sessionId: currentSession._id,
        userId: 'user1',
        message: userMessage,
        response: mockResponse.message,
        timestamp: new Date().toISOString(),
        messageType: 'text',
        language,
        isUser: false,
        metadata: {
          confidence: mockResponse.confidence,
          source: mockResponse.source,
          category: mockResponse.category,
          entities: mockResponse.entities,
        },
      };

      setMessages(prev => [...prev, botMessage]);
      setSuggestions(mockResponse.suggestions || []);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setShowSessions(false);
    chatbotService.setCurrentSessionId(session._id);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ml' : 'en';
    setLanguage(newLanguage);
    setShowSuggestions(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.isUser ? item.message : item.response}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isUser ? styles.userMessageTime : styles.botMessageTime
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderSuggestion = (suggestion: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionChip}
      onPress={() => handleSuggestionPress(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  const renderSession = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={[
        styles.sessionItem,
        currentSession?._id === item._id && styles.selectedSession
      ]}
      onPress={() => handleSessionSelect(item)}
    >
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{item.title}</Text>
        <Text style={styles.sessionMeta}>
          {item.messageCount} messages • {item.language.toUpperCase()}
        </Text>
        {item.lastMessage && (
          <Text style={styles.sessionLastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </View>
      <Text style={styles.sessionDate}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Krishi Sakhi AI' : 'കൃഷി സഖി AI'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentSession?.messageCount || 0} messages
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageText}>
              {language === 'en' ? 'ML' : 'EN'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sessionsButton}
            onPress={() => setShowSessions(!showSessions)}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {showSessions && (
        <View style={styles.sessionsContainer}>
          <View style={styles.sessionsHeader}>
            <Text style={styles.sessionsTitle}>Chat History</Text>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={createNewSession}
            >
              <Ionicons name="add" size={20} color="#4CAF50" />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={(item) => item._id}
            style={styles.sessionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              {language === 'en' ? 'Suggested Questions:' : 'നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ:'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
            >
              {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={language === 'en' ? 'Ask me anything about farming...' : 'കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കുക...'}
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: 8,
  },
  languageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sessionsButton: {
    padding: 8,
  },
  sessionsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 300,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sessionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 16,
  },
  newChatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 4,
  },
  sessionsList: {
    maxHeight: 200,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedSession: {
    backgroundColor: '#f0f8f0',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  sessionLastMessage: {
    fontSize: 12,
    color: '#999',
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: '#999',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
  },
  suggestionChip: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default Chatbot;
