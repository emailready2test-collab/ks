import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { knowledgeService } from '../services/knowledgeService';

interface AddKnowledgeProps {
  navigation: any;
}

const AddKnowledge: React.FC<AddKnowledgeProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const categoryOptions = [
    { value: 'crop_guide', label: 'Crop Guides' },
    { value: 'diseases', label: 'Diseases' },
    { value: 'soil_irrigation', label: 'Soil & Irrigation' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'weather', label: 'Weather' },
    { value: 'market', label: 'Market' },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // For now, use mock categories. In production, use: const data = await knowledgeService.getKnowledgeCategories();
      const mockCategories = ['crop_guide', 'diseases', 'soil_irrigation', 'pest_control', 'fertilizers', 'weather', 'market'];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Please enter content');
      return false;
    }
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category,
        tags: tagArray,
      };

      // For now, just show success. In production, use: await knowledgeService.addKnowledgeItem(itemData);
      console.log('Adding knowledge item:', itemData);
      
      Alert.alert(
        'Success',
        'Knowledge item added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      Alert.alert('Error', 'Failed to add knowledge item');
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categoryOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.categoryOption,
              category === option.value && styles.selectedCategoryOption,
            ]}
            onPress={() => setCategory(option.value)}
          >
            <Text
              style={[
                styles.categoryOptionText,
                category === option.value && styles.selectedCategoryOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
        <Text style={styles.headerTitle}>Add Knowledge</Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.submitButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter knowledge item title"
                placeholderTextColor="#999"
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter a brief description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {renderCategorySelector()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tags</Text>
              <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="Enter tags separated by commas (e.g., rice, cultivation, monsoon)"
                placeholderTextColor="#999"
              />
              <Text style={styles.helpText}>
                Separate multiple tags with commas
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.contentArea]}
                value={content}
                onChangeText={setContent}
                placeholder="Enter detailed content..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddKnowledge;
