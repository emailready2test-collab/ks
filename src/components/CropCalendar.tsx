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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cropCalendarService, Activity, Crop, CalendarEvent } from '../services/cropCalendarService';

interface CropCalendarProps {
  navigation: any;
}

const CropCalendar: React.FC<CropCalendarProps> = ({ navigation }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'activities' | 'crops'>('calendar');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const activityTypes = [
    { value: 'planting', label: 'Planting', icon: 'leaf-outline', color: '#4CAF50' },
    { value: 'irrigation', label: 'Irrigation', icon: 'water-outline', color: '#2196F3' },
    { value: 'fertilizing', label: 'Fertilizing', icon: 'flask-outline', color: '#FF9800' },
    { value: 'pest_control', label: 'Pest Control', icon: 'bug-outline', color: '#F44336' },
    { value: 'harvesting', label: 'Harvesting', icon: 'cut-outline', color: '#9C27B0' },
    { value: 'maintenance', label: 'Maintenance', icon: 'construct-outline', color: '#607D8B' },
  ];

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    urgent: '#E91E63',
  };

  const statusColors = {
    pending: '#FF9800',
    in_progress: '#2196F3',
    completed: '#4CAF50',
    overdue: '#F44336',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In production, use actual API calls
      const mockActivities = cropCalendarService.getMockActivities();
      const mockCrops = cropCalendarService.getMockCrops();
      const mockEvents = cropCalendarService.getMockCalendarEvents();
      
      setActivities(mockActivities);
      setCrops(mockCrops);
      setCalendarEvents(mockEvents);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadStats = async () => {
    try {
      // For now, calculate mock stats. In production, use: const data = await cropCalendarService.getActivityStats();
      const completed = activities.filter(a => a.status === 'completed').length;
      const pending = activities.filter(a => a.status === 'pending').length;
      const overdue = activities.filter(a => a.status === 'overdue').length;
      const inProgress = activities.filter(a => a.status === 'in_progress').length;
      
      setStats({
        total: activities.length,
        completed,
        pending,
        overdue,
        inProgress,
        completionRate: activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleMarkComplete = async (activityId: string) => {
    try {
      // For now, just update local state. In production, use: await cropCalendarService.markActivityComplete(activityId, { completedDate: new Date().toISOString() });
      setActivities(prevActivities =>
        prevActivities.map(activity =>
          activity._id === activityId
            ? {
                ...activity,
                status: 'completed' as const,
                completedDate: new Date().toISOString(),
              }
            : activity
        )
      );
      Alert.alert('Success', 'Activity marked as completed');
    } catch (error) {
      console.error('Error marking activity complete:', error);
      Alert.alert('Error', 'Failed to mark activity as completed');
    }
  };

  const getActivityIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : 'help-outline';
  };

  const getActivityColor = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.color : '#666';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Calendar</Text>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => {
            loadStats();
            setShowStatsModal(true);
          }}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Crop Calendar Content</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddActivity')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  statsButton: {
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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

export default CropCalendar;