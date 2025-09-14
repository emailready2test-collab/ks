import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alertsService, GovernmentScheme } from '../services/alertsService';

interface GovernmentSchemesProps {
  navigation: any;
}

const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ navigation }) => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const schemeCategories = [
    { value: 'all', label: 'All', icon: 'list-outline', color: '#666' },
    { value: 'subsidy', label: 'Subsidy', icon: 'cash-outline', color: '#4CAF50' },
    { value: 'loan', label: 'Loan', icon: 'card-outline', color: '#2196F3' },
    { value: 'insurance', label: 'Insurance', icon: 'shield-outline', color: '#FF9800' },
    { value: 'training', label: 'Training', icon: 'school-outline', color: '#9C27B0' },
    { value: 'equipment', label: 'Equipment', icon: 'construct-outline', color: '#F44336' },
    { value: 'other', label: 'Other', icon: 'help-outline', color: '#607D8B' },
  ];

  const categoryColors = {
    subsidy: '#4CAF50',
    loan: '#2196F3',
    insurance: '#FF9800',
    training: '#9C27B0',
    equipment: '#F44336',
    other: '#607D8B',
  };

  const categoryLabels = {
    subsidy: 'Subsidy',
    loan: 'Loan',
    insurance: 'Insurance',
    training: 'Training',
    equipment: 'Equipment',
    other: 'Other',
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In production, use: const data = await alertsService.getGovernmentSchemes();
      const mockSchemes = alertsService.getMockGovernmentSchemes();
      setSchemes(mockSchemes);
    } catch (error) {
      console.error('Error loading government schemes:', error);
      Alert.alert('Error', 'Failed to load government schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchemes();
    setRefreshing(false);
  };

  const handleSchemePress = (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme);
    setShowDetailModal(true);
  };

  const handleContactPress = async (contactInfo: any, type: 'phone' | 'email' | 'website') => {
    try {
      let url = '';
      switch (type) {
        case 'phone':
          url = `tel:${contactInfo.phone}`;
          break;
        case 'email':
          url = `mailto:${contactInfo.email}`;
          break;
        case 'website':
          url = contactInfo.website;
          break;
      }
      
      if (url) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening contact:', error);
      Alert.alert('Error', 'Failed to open contact information');
    }
  };

  const getCategoryIcon = (category: string) => {
    const schemeCategory = schemeCategories.find(c => c.value === category);
    return schemeCategory ? schemeCategory.icon : 'help-outline';
  };

  const getCategoryColor = (category: string) => {
    const schemeCategory = schemeCategories.find(c => c.value === category);
    return schemeCategory ? schemeCategory.color : '#666';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredSchemes = filterCategory === 'all' 
    ? schemes 
    : schemes.filter(scheme => scheme.category === filterCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Schemes</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading government schemes...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Government Schemes Content</Text>
        </View>
      )}
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default GovernmentSchemes;