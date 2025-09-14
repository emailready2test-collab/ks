import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../services/authService';
import { weatherService } from '../services/weatherService';
import { errorService } from '../services/errorService';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const quickActions = [
    {
      id: 'crop-doctor',
      title: 'Crop Doctor',
      subtitle: 'AI Disease Detection',
      icon: 'camera-alt',
      color: '#e74c3c',
      screen: 'CropDoctor',
    },
    {
      id: 'community',
      title: 'Community',
      subtitle: 'Ask & Share',
      icon: 'people',
      color: '#3498db',
      screen: 'Community',
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      subtitle: 'Get Help',
      icon: 'chat',
      color: '#2ecc71',
      screen: 'Chat',
    },
    {
      id: 'calendar',
      title: 'Crop Calendar',
      subtitle: 'Track Activities',
      icon: 'calendar-today',
      color: '#f39c12',
      screen: 'Calendar',
    },
    {
      id: 'weather',
      title: 'Weather',
      subtitle: 'Forecast & Alerts',
      icon: 'wb-sunny',
      color: '#9b59b6',
      screen: 'WeatherAlerts',
    },
    {
      id: 'market',
      title: 'Market Prices',
      subtitle: 'Current Rates',
      icon: 'trending-up',
      color: '#1abc9c',
      screen: 'MarketPrices',
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user profile
      const profileResponse = await authService.getProfile();
      if (profileResponse.success) {
        setUser(profileResponse.data.user);
      }

      // Load weather data
      try {
        const weather = await weatherService.getCurrentWeather();
        setWeatherData(weather);
      } catch (weatherError) {
        console.error('Weather load error:', weatherError);
        // Use mock data if API fails
        setWeatherData(weatherService.getMockWeatherData());
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      const errorMessage = errorService.getUserFriendlyMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action) => {
    navigation.navigate(action.screen);
  };

  const renderWeatherCard = () => {
    if (!weatherData) return null;

    return (
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <Icon name="wb-sunny" size={24} color="#f39c12" />
          <Text style={styles.weatherTitle}>Current Weather</Text>
        </View>
        <View style={styles.weatherContent}>
          <View style={styles.weatherMain}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetail}>
              <Icon name="opacity" size={16} color="#3498db" />
              <Text style={styles.weatherDetailText}>{weatherData.humidity}%</Text>
            </View>
            <View style={styles.weatherDetail}>
              <Icon name="air" size={16} color="#95a5a6" />
              <Text style={styles.weatherDetailText}>{weatherData.windSpeed} km/h</Text>
            </View>
            <View style={styles.weatherDetail}>
              <Icon name="grain" size={16} color="#2ecc71" />
              <Text style={styles.weatherDetailText}>{weatherData.rainfall}mm</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Icon name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFarmInfo = () => {
    if (!user?.farmDetails) return null;

    return (
      <View style={styles.farmInfoCard}>
        <Text style={styles.sectionTitle}>Your Farm</Text>
        <View style={styles.farmInfoContent}>
          <View style={styles.farmInfoItem}>
            <Icon name="location-on" size={20} color="#e74c3c" />
            <Text style={styles.farmInfoText}>
              {user.farmDetails.location?.district || 'Location not set'}
            </Text>
          </View>
          <View style={styles.farmInfoItem}>
            <Icon name="straighten" size={20} color="#2ecc71" />
            <Text style={styles.farmInfoText}>
              {user.farmDetails.farmSize || 0} acres
            </Text>
          </View>
          <View style={styles.farmInfoItem}>
            <Icon name="eco" size={20} color="#f39c12" />
            <Text style={styles.farmInfoText}>
              {user.farmDetails.soilType || 'Soil type not set'}
            </Text>
          </View>
          <View style={styles.farmInfoItem}>
            <Icon name="water-drop" size={20} color="#3498db" />
            <Text style={styles.farmInfoText}>
              {user.farmDetails.irrigationType || 'Irrigation not set'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecentActivities = () => (
    <View style={styles.recentActivitiesCard}>
      <View style={styles.recentActivitiesHeader}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ActivityTracking')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recentActivitiesContent}>
        <View style={styles.emptyActivity}>
          <Icon name="track-changes" size={40} color="#ccc" />
          <Text style={styles.emptyActivityText}>No recent activities</Text>
          <Text style={styles.emptyActivitySubtext}>
            Start tracking your farming activities
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d5016" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#2d5016']}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {renderWeatherCard()}
      {renderFarmInfo()}
      {renderQuickActions()}
      {renderRecentActivities()}
    </ScrollView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2d5016',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherMain: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  farmInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
  },
  farmInfoContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  farmInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  farmInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentActivitiesCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentActivitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2d5016',
    fontWeight: 'bold',
  },
  recentActivitiesContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivity: {
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default DashboardScreen;
