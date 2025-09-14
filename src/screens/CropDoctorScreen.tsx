import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { diseaseService } from '../services/diseaseService';
import { errorService } from '../services/errorService';
import { weatherService } from '../services/weatherService';

const { width } = Dimensions.get('window');

const CropDoctorScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropInfo, setCropInfo] = useState({
    cropName: '',
    variety: '',
    stage: 'vegetative',
    plantingDate: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  const cropStages = [
    { label: 'Seedling', value: 'seedling' },
    { label: 'Vegetative', value: 'vegetative' },
    { label: 'Flowering', value: 'flowering' },
    { label: 'Fruiting', value: 'fruiting' },
    { label: 'Mature', value: 'mature' },
  ];

  const commonCrops = [
    'Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Onion', 'Chili', 'Brinjal',
    'Cabbage', 'Cauliflower', 'Carrot', 'Radish', 'Spinach', 'Okra', 'Cucumber'
  ];

  useEffect(() => {
    // Get current weather data
    getWeatherData();
  }, []);

  const getWeatherData = async () => {
    try {
      const weather = await weatherService.getCurrentWeather();
      setWeatherData(weather);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const showImagePickerModal = () => {
    setShowImagePicker(true);
  };

  const hideImagePickerModal = () => {
    setShowImagePicker(false);
  };

  const selectImage = (source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
        });
        setAnalysisResult(null); // Clear previous results
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
    
    hideImagePickerModal();
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!cropInfo.cropName.trim()) {
      Alert.alert('Error', 'Please enter the crop name');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'image.jpg',
      });
      formData.append('cropInfo', JSON.stringify(cropInfo));
      formData.append('weather', JSON.stringify(weatherData));

      const result = await diseaseService.analyzeDisease(formData);
      
      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        Alert.alert('Analysis Failed', result.message);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = errorService.getUserFriendlyMessage(error);
      Alert.alert('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = async () => {
    if (!analysisResult) return;

    try {
      await diseaseService.saveDiseaseReport(analysisResult);
      Alert.alert('Success', 'Disease report saved successfully');
    } catch (error) {
      console.error('Save report error:', error);
      const errorMessage = errorService.getUserFriendlyMessage(error);
      Alert.alert('Save Failed', errorMessage);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setCropInfo({
      cropName: '',
      variety: '',
      stage: 'vegetative',
      plantingDate: '',
    });
    setAnalysisResult(null);
  };

  const renderImagePicker = () => (
    <Modal
      visible={showImagePicker}
      transparent
      animationType="slide"
      onRequestClose={hideImagePickerModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Image Source</Text>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectImage('camera')}
          >
            <Icon name="camera-alt" size={24} color="#2d5016" />
            <Text style={styles.modalButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectImage('gallery')}
          >
            <Icon name="photo-library" size={24} color="#2d5016" />
            <Text style={styles.modalButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={hideImagePickerModal}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const { aiAnalysis, treatment } = analysisResult;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Analysis Results</Text>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultSubtitle}>Disease Detection</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Disease Detected:</Text>
            <Text style={[
              styles.resultValue,
              { color: aiAnalysis.diseaseDetected ? '#e74c3c' : '#27ae60' }
            ]}>
              {aiAnalysis.diseaseDetected ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {aiAnalysis.diseaseDetected && (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Disease Name:</Text>
                <Text style={styles.resultValue}>{aiAnalysis.diseaseName}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Confidence:</Text>
                <Text style={styles.resultValue}>{aiAnalysis.confidence}%</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Severity:</Text>
                <Text style={[
                  styles.resultValue,
                  { 
                    color: aiAnalysis.severity === 'severe' ? '#e74c3c' : 
                           aiAnalysis.severity === 'moderate' ? '#f39c12' : '#27ae60'
                  }
                ]}>
                  {aiAnalysis.severity}
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Affected Area:</Text>
                <Text style={styles.resultValue}>{aiAnalysis.affectedArea}%</Text>
              </View>
            </>
          )}
        </View>

        {aiAnalysis.diseaseDetected && treatment && (
          <View style={styles.treatmentContainer}>
            <Text style={styles.resultSubtitle}>Treatment Recommendations</Text>
            
            {treatment.organic && treatment.organic.length > 0 && (
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Organic Treatment</Text>
                {treatment.organic.map((item, index) => (
                  <View key={index} style={styles.treatmentItem}>
                    <Text style={styles.treatmentName}>{item.name}</Text>
                    <Text style={styles.treatmentDescription}>{item.description}</Text>
                    <Text style={styles.treatmentDosage}>Dosage: {item.dosage}</Text>
                    <Text style={styles.treatmentFrequency}>Frequency: {item.frequency}</Text>
                    <Text style={styles.treatmentCost}>Cost: ₹{item.cost}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {treatment.chemical && treatment.chemical.length > 0 && (
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Chemical Treatment</Text>
                {treatment.chemical.map((item, index) => (
                  <View key={index} style={styles.treatmentItem}>
                    <Text style={styles.treatmentName}>{item.name}</Text>
                    <Text style={styles.treatmentDescription}>{item.description}</Text>
                    <Text style={styles.treatmentDosage}>Dosage: {item.dosage}</Text>
                    <Text style={styles.treatmentFrequency}>Frequency: {item.frequency}</Text>
                    <Text style={styles.treatmentCost}>Cost: ₹{item.cost}</Text>
                    {item.safetyPrecautions && (
                      <Text style={styles.safetyPrecautions}>
                        Safety: {item.safetyPrecautions.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            {treatment.preventive && treatment.preventive.length > 0 && (
              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Preventive Measures</Text>
                {treatment.preventive.map((item, index) => (
                  <View key={index} style={styles.treatmentItem}>
                    <Text style={styles.treatmentName}>{item.measure}</Text>
                    <Text style={styles.treatmentDescription}>{item.description}</Text>
                    <Text style={styles.treatmentFrequency}>Frequency: {item.frequency}</Text>
                    <Text style={styles.treatmentCost}>Cost: ₹{item.cost}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveReport}
          >
            <Icon name="save" size={20} color="white" />
            <Text style={styles.buttonText}>Save Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetForm}
          >
            <Icon name="refresh" size={20} color="#2d5016" />
            <Text style={[styles.buttonText, { color: '#2d5016' }]}>New Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="camera-alt" size={40} color="#2d5016" />
        <Text style={styles.title}>Crop Doctor</Text>
        <Text style={styles.subtitle}>
          Upload crop image for AI-powered disease detection
        </Text>
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>1. Select Crop Image</Text>
        
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={showImagePickerModal}
            >
              <Icon name="edit" size={20} color="white" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={showImagePickerModal}
          >
            <Icon name="add-a-photo" size={50} color="#666" />
            <Text style={styles.placeholderText}>Tap to select image</Text>
            <Text style={styles.placeholderSubtext}>
              Take photo or choose from gallery
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cropInfoSection}>
        <Text style={styles.sectionTitle}>2. Enter Crop Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Crop Name *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cropChips}>
              {commonCrops.map((crop, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cropChip,
                    cropInfo.cropName === crop && styles.selectedChip
                  ]}
                  onPress={() => setCropInfo(prev => ({ ...prev, cropName: crop }))}
                >
                  <Text style={[
                    styles.cropChipText,
                    cropInfo.cropName === crop && styles.selectedChipText
                  ]}>
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Variety (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter crop variety"
            value={cropInfo.variety}
            onChangeText={(value) => setCropInfo(prev => ({ ...prev, variety: value }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Growth Stage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.stageChips}>
              {cropStages.map((stage, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.stageChip,
                    cropInfo.stage === stage.value && styles.selectedChip
                  ]}
                  onPress={() => setCropInfo(prev => ({ ...prev, stage: stage.value }))}
                >
                  <Text style={[
                    styles.stageChipText,
                    cropInfo.stage === stage.value && styles.selectedChipText
                  ]}>
                    {stage.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.analyzeSection}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!selectedImage || !cropInfo.cropName || isAnalyzing) && styles.disabledButton
          ]}
          onPress={analyzeImage}
          disabled={!selectedImage || !cropInfo.cropName || isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="analytics" size={24} color="white" />
              <Text style={styles.analyzeButtonText}>Analyze Disease</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderAnalysisResult()}
      {renderImagePicker()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
  imageSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 60,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d5016',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  changeImageText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  cropInfoSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cropChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#2d5016',
  },
  cropChipText: {
    fontSize: 12,
    color: '#666',
  },
  selectedChipText: {
    color: 'white',
  },
  stageChips: {
    flexDirection: 'row',
  },
  stageChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  stageChipText: {
    fontSize: 12,
    color: '#666',
  },
  analyzeSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d5016',
    paddingVertical: 15,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  treatmentContainer: {
    marginTop: 15,
  },
  treatmentSection: {
    marginBottom: 15,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  treatmentItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  treatmentDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  treatmentDosage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  treatmentFrequency: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  treatmentCost: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: 'bold',
    marginTop: 2,
  },
  safetyPrecautions: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  resetButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2d5016',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: width - 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CropDoctorScreen;
