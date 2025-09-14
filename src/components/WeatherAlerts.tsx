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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alertsService, WeatherAlert } from '../services/alertsService';

interface WeatherAlertsProps {
  navigation: any;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const alertTypes = [
    { value: 'all', label: 'All', icon: 'list-outline', color: '#666' },
    { value: 'rain', label: 'Rain', icon: 'rainy-outline', color: '#2196F3' },
    { value: 'drought', label: 'Drought', icon: 'sunny-outline', color: '#FF9800' },
    { value: 'storm', label: 'Storm', icon: 'thunderstorm-outline', color: '#9C27B0' },
    { value: 'heat', label: 'Heat', icon: 'flame-outline', color: '#F44336' },
    { value: 'cold', label: 'Cold', icon: 'snow-outline', color: '#00BCD4' },
    { value: 'wind', label: 'Wind', icon: 'leaf-outline', color: '#4CAF50' },
    { value: 'flood', label: 'Flood', icon: 'water-outline', color: '#3F51B5' },
  ];

  const severityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    critical: '#E91E63',
  };

  const severityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In production, use: const data = await alertsService.getWeatherAlerts();
      const mockAlerts = alertsService.getMockWeatherAlerts();
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading weather alerts:', error);
      Alert.alert('Error', 'Failed to load weather alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAlertPress = (alert: WeatherAlert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const getAlertIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    return alertType ? alertType.icon : 'help-outline';
  };

  const getAlertColor = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    return alertType ? alertType.color : '#666';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Alerts</Text>
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
          <Text style={styles.loadingText}>Loading weather alerts...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Weather Alerts Content</Text>
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

export default WeatherAlerts;