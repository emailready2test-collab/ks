import React, { useState } from 'react';
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

interface AddActivityProps {
  navigation: any;
}

const AddActivity: React.FC<AddActivityProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [cropId, setCropId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const activityTypes = [
    { value: 'planting', label: 'Planting', icon: 'leaf-outline', color: '#4CAF50' },
    { value: 'irrigation', label: 'Irrigation', icon: 'water-outline', color: '#2196F3' },
    { value: 'fertilizing', label: 'Fertilizing', icon: 'flask-outline', color: '#FF9800' },
    { value: 'pest_control', label: 'Pest Control', icon: 'bug-outline', color: '#F44336' },
    { value: 'harvesting', label: 'Harvesting', icon: 'cut-outline', color: '#9C27B0' },
    { value: 'maintenance', label: 'Maintenance', icon: 'construct-outline', color: '#607D8B' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#F44336' },
    { value: 'urgent', label: 'Urgent', color: '#E91E63' },
  ];

  const mockCrops = [
    { _id: 'crop1', name: 'Rice - Basmati' },
    { _id: 'crop2', name: 'Wheat - Durum' },
    { _id: 'crop3', name: 'Corn - Sweet' },
  ];

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }
    if (!type) {
      Alert.alert('Validation Error', 'Please select an activity type');
      return false;
    }
    if (!priority) {
      Alert.alert('Validation Error', 'Please select a priority');
      return false;
    }
    if (!dueDate) {
      Alert.alert('Validation Error', 'Please select a due date');
      return false;
    }
    if (!estimatedDuration || isNaN(Number(estimatedDuration))) {
      Alert.alert('Validation Error', 'Please enter a valid estimated duration');
      return false;
    }
    if (!cropId) {
      Alert.alert('Validation Error', 'Please select a crop');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const activityData = {
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        estimatedDuration: Number(estimatedDuration),
        cropId,
        notes: notes.trim(),
        status: 'pending',
      };

      // For now, just show success. In production, use: await cropCalendarService.createActivity(activityData);
      console.log('Creating activity:', activityData);
      
      Alert.alert(
        'Success',
        'Activity created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Activity Type *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {activityTypes.map((activityType) => (
          <TouchableOpacity
            key={activityType.value}
            style={[
              styles.selectorOption,
              type === activityType.value && styles.selectedSelectorOption,
            ]}
            onPress={() => setType(activityType.value)}
          >
            <Ionicons
              name={activityType.icon as any}
              size={24}
              color={type === activityType.value ? '#fff' : activityType.color}
            />
            <Text
              style={[
                styles.selectorOptionText,
                type === activityType.value && styles.selectedSelectorOptionText,
              ]}
            >
              {activityType.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Priority *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {priorities.map((priorityOption) => (
          <TouchableOpacity
            key={priorityOption.value}
            style={[
              styles.priorityOption,
              priority === priorityOption.value && styles.selectedPriorityOption,
              { borderColor: priorityOption.color },
            ]}
            onPress={() => setPriority(priorityOption.value)}
          >
            <Text
              style={[
                styles.priorityOptionText,
                priority === priorityOption.value && styles.selectedPriorityOptionText,
                { color: priority === priorityOption.value ? '#fff' : priorityOption.color },
              ]}
            >
              {priorityOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCropSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Crop *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {mockCrops.map((crop) => (
          <TouchableOpacity
            key={crop._id}
            style={[
              styles.cropOption,
              cropId === crop._id && styles.selectedCropOption,
            ]}
            onPress={() => setCropId(crop._id)}
          >
            <Text
              style={[
                styles.cropOptionText,
                cropId === crop._id && styles.selectedCropOptionText,
              ]}
            >
              {crop.name}
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
        <Text style={styles.headerTitle}>Add Activity</Text>
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
                placeholder="Enter activity title"
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
                placeholder="Enter activity description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {renderTypeSelector()}
            {renderPrioritySelector()}
            {renderCropSelector()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date *</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              <Text style={styles.helpText}>
                Enter date in YYYY-MM-DD format
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estimated Duration (hours) *</Text>
              <TextInput
                style={styles.input}
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                placeholder="Enter estimated duration"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter any additional notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
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
  notesArea: {
    height: 100,
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
  selectorContainer: {
    marginBottom: 20,
  },
  selectorScroll: {
    marginTop: 8,
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 100,
  },
  selectedSelectorOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  selectorOptionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedSelectorOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedPriorityOption: {
    backgroundColor: '#4CAF50',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedPriorityOptionText: {
    color: '#fff',
  },
  cropOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 120,
  },
  selectedCropOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  cropOptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedCropOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddActivity;
