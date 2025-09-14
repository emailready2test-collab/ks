import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alertsService, NotificationSettings } from '../services/alertsService';

interface NotificationSettingsProps {
  navigation: any;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const alertTypes = [
    { value: 'rain', label: 'Rain', icon: 'rainy-outline', color: '#2196F3' },
    { value: 'drought', label: 'Drought', icon: 'sunny-outline', color: '#FF9800' },
    { value: 'storm', label: 'Storm', icon: 'thunderstorm-outline', color: '#9C27B0' },
    { value: 'heat', label: 'Heat', icon: 'flame-outline', color: '#F44336' },
    { value: 'cold', label: 'Cold', icon: 'snow-outline', color: '#00BCD4' },
    { value: 'wind', label: 'Wind', icon: 'leaf-outline', color: '#4CAF50' },
    { value: 'flood', label: 'Flood', icon: 'water-outline', color: '#3F51B5' },
  ];

  const schemeCategories = [
    { value: 'subsidy', label: 'Subsidy', icon: 'cash-outline', color: '#4CAF50' },
    { value: 'loan', label: 'Loan', icon: 'card-outline', color: '#2196F3' },
    { value: 'insurance', label: 'Insurance', icon: 'shield-outline', color: '#FF9800' },
    { value: 'training', label: 'Training', icon: 'school-outline', color: '#9C27B0' },
    { value: 'equipment', label: 'Equipment', icon: 'construct-outline', color: '#F44336' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In production, use: const data = await alertsService.getNotificationSettings();
      const mockSettings = alertsService.getMockNotificationSettings();
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      // For now, just show success. In production, use: await alertsService.updateNotificationSettings(settings);
      console.log('Saving notification settings:', settings);
      
      Alert.alert('Success', 'Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [key]: !prev![key],
    }));
  };

  const handleToggleAlertType = (alertType: string) => {
    if (!settings) return;
    
    const currentTypes = settings.alertTypes || [];
    const newTypes = currentTypes.includes(alertType)
      ? currentTypes.filter(type => type !== alertType)
      : [...currentTypes, alertType];
    
    setSettings(prev => ({
      ...prev!,
      alertTypes: newTypes,
    }));
  };

  const handleToggleSchemeCategory = (category: string) => {
    if (!settings) return;
    
    const currentCategories = settings.schemeCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(cat => cat !== category)
      : [...currentCategories, category];
    
    setSettings(prev => ({
      ...prev!,
      schemeCategories: newCategories,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error Loading Settings</Text>
          <Text style={styles.errorText}>Failed to load notification settings</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-outline" size={24} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Weather Alerts</Text>
                <Text style={styles.settingDescription}>Receive weather alerts and warnings</Text>
              </View>
            </View>
            <Switch
              value={settings.weatherAlerts}
              onValueChange={() => handleToggleSetting('weatherAlerts')}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={settings.weatherAlerts ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="business-outline" size={24} color="#FF9800" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Government Schemes</Text>
                <Text style={styles.settingDescription}>Receive updates about government schemes</Text>
              </View>
            </View>
            <Switch
              value={settings.governmentSchemes}
              onValueChange={() => handleToggleSetting('governmentSchemes')}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={settings.governmentSchemes ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Methods</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive push notifications on your device</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => handleToggleSetting('pushNotifications')}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={settings.pushNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={24} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via email</Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggleSetting('emailNotifications')}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={settings.emailNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-outline" size={24} color="#FF9800" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via SMS</Text>
              </View>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={() => handleToggleSetting('smsNotifications')}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={settings.smsNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Alert Types</Text>
          <Text style={styles.sectionDescription}>Select which weather alert types you want to receive</Text>
          
          <View style={styles.optionsContainer}>
            {alertTypes.map((alertType) => (
              <TouchableOpacity
                key={alertType.value}
                style={[
                  styles.optionItem,
                  settings.alertTypes.includes(alertType.value) && styles.selectedOptionItem,
                ]}
                onPress={() => handleToggleAlertType(alertType.value)}
              >
                <Ionicons
                  name={alertType.icon as any}
                  size={20}
                  color={settings.alertTypes.includes(alertType.value) ? '#fff' : alertType.color}
                />
                <Text
                  style={[
                    styles.optionText,
                    settings.alertTypes.includes(alertType.value) && styles.selectedOptionText,
                  ]}
                >
                  {alertType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Government Scheme Categories</Text>
          <Text style={styles.sectionDescription}>Select which scheme categories you want to receive updates for</Text>
          
          <View style={styles.optionsContainer}>
            {schemeCategories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.optionItem,
                  settings.schemeCategories.includes(category.value) && styles.selectedOptionItem,
                ]}
                onPress={() => handleToggleSchemeCategory(category.value)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={settings.schemeCategories.includes(category.value) ? '#fff' : category.color}
                />
                <Text
                  style={[
                    styles.optionText,
                    settings.schemeCategories.includes(category.value) && styles.selectedOptionText,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOptionItem: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default NotificationSettingsComponent;
