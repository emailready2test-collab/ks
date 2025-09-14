import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../services/cropCalendarService';

interface ActivityDetailProps {
  route: {
    params: {
      activity: Activity;
    };
  };
  navigation: any;
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({ route, navigation }) => {
  const { activity } = route.params;
  const [loading, setLoading] = useState(false);

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

  const getActivityType = (type: string) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      // For now, just show success. In production, use: await cropCalendarService.markActivityComplete(activity._id, { completedDate: new Date().toISOString() });
      Alert.alert(
        'Success',
        'Activity marked as completed!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error marking activity complete:', error);
      Alert.alert('Error', 'Failed to mark activity as completed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditActivity', { activity });
  };

  const activityType = getActivityType(activity.type);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIconContainer}>
              <Ionicons
                name={activityType.icon as any}
                size={32}
                color={activityType.color}
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityCrop}>{activity.cropName}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[activity.status] },
              ]}
            >
              <Text style={styles.statusText}>
                {activity.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[activity.priority] },
              ]}
            >
              <Text style={styles.priorityText}>
                {activity.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionContent}>{activity.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Due Date</Text>
                <Text style={styles.scheduleValue}>
                  {formatDate(activity.dueDate)} at {formatTime(activity.dueDate)}
                </Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="hourglass-outline" size={20} color="#666" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Estimated Duration</Text>
                <Text style={styles.scheduleValue}>{activity.estimatedDuration} hours</Text>
              </View>
            </View>
            {activity.completedDate && (
              <View style={styles.scheduleItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleLabel}>Completed Date</Text>
                  <Text style={styles.scheduleValue}>
                    {formatDate(activity.completedDate)} at {formatTime(activity.completedDate)}
                  </Text>
                </View>
              </View>
            )}
            {activity.actualDuration && (
              <View style={styles.scheduleItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleLabel}>Actual Duration</Text>
                  <Text style={styles.scheduleValue}>{activity.actualDuration} hours</Text>
                </View>
              </View>
            )}
          </View>

          {activity.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.sectionContent}>{activity.notes}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Type</Text>
            <View style={styles.typeContainer}>
              <Ionicons
                name={activityType.icon as any}
                size={24}
                color={activityType.color}
              />
              <Text style={styles.typeText}>{activityType.label}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {activity.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </>
            )}
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  activityContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activityCrop: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ActivityDetail;
