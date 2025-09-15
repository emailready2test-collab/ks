import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import CropDoctorScreen from './screens/CropDoctorScreen';
import CommunityScreen from './screens/CommunityScreen';
import ChatScreen from './screens/ChatScreen';
// Temporarily disable ActivityTracking screen for web build
const ActivityTrackingScreen = DashboardScreen;
import CropCalendarScreen from './screens/CropCalendarScreen';
import WeatherAlertsScreen from './screens/WeatherAlertsScreen';
import GovernmentSchemesScreen from './screens/GovernmentSchemesScreen';
import KnowledgeBaseScreen from './screens/KnowledgeBaseScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import knowledge base components
import KnowledgeBase from './components/KnowledgeBase';
import KnowledgeDetail from './components/KnowledgeDetail';
import AddKnowledge from './components/AddKnowledge';

// Import crop calendar components
import CropCalendar from './components/CropCalendar';
import ActivityDetail from './components/ActivityDetail';
import AddActivity from './components/AddActivity';

// Import alerts system components
import WeatherAlerts from './components/WeatherAlerts';
import GovernmentSchemes from './components/GovernmentSchemes';
import NotificationSettings from './components/NotificationSettings';

// Import error handling components
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import RetryComponent from './components/RetryComponent';

// Import chatbot components
import Chatbot from './components/Chatbot';
import VoiceMessage from './components/VoiceMessage';

// Import services
import { authService } from './services/authService';
import { errorService } from './services/errorService';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'CropDoctor':
              iconName = 'camera-alt';
              break;
            case 'Community':
              iconName = 'people';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Calendar':
              iconName = 'calendar-today';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2d5016',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="CropDoctor" 
        component={CropDoctorScreen}
        options={{ title: 'Crop Doctor' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CropCalendarScreen}
        options={{ title: 'Calendar' }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2d5016',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#f8f9fa',
        },
        drawerActiveTintColor: '#2d5016',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          title: 'Krishi Sakhi',
          drawerIcon: ({ color, size }) => (
            <Icon name="agriculture" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="WeatherAlerts" 
        component={WeatherAlertsScreen}
        options={{
          title: 'Weather Alerts',
          drawerIcon: ({ color, size }) => (
            <Icon name="wb-sunny" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="GovernmentSchemes" 
        component={GovernmentSchemesScreen}
        options={{
          title: 'Govt Schemes',
          drawerIcon: ({ color, size }) => (
            <Icon name="account-balance" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="KnowledgeBase" 
        component={KnowledgeBaseScreen}
        options={{
          title: 'Knowledge Base',
          drawerIcon: ({ color, size }) => (
            <Icon name="library-books" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ActivityTracking" 
        component={ActivityTrackingScreen}
        options={{
          title: 'Activity Tracking',
          drawerIcon: ({ color, size }) => (
            <Icon name="track-changes" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Handle back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // You can add custom back button handling here
      return false; // Let the default behavior happen
    });

    return () => backHandler.remove();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        // Verify token with server
        const isValid = await authService.verifyToken(token);
        if (isValid) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Clear invalid data
          await AsyncStorage.multiRemove(['authToken', 'userData']);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      errorService.handleError(error, 'checkAuthStatus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      errorService.handleError(error, 'handleLogin');
      Alert.alert('Error', 'Failed to save login data');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      errorService.handleError(error, 'handleLogout');
    }
  };

  if (isLoading) {
    return (
      <StatusBar 
        backgroundColor="#2d5016" 
        barStyle="light-content" 
      />
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar 
          backgroundColor="#2d5016" 
          barStyle="light-content" 
        />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainApp" component={DrawerNavigator} />
              <Stack.Screen name="KnowledgeBase" component={KnowledgeBase} />
              <Stack.Screen name="KnowledgeDetail" component={KnowledgeDetail} />
              <Stack.Screen name="AddKnowledge" component={AddKnowledge} />
              <Stack.Screen name="CropCalendar" component={CropCalendar} />
              <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
              <Stack.Screen name="AddActivity" component={AddActivity} />
            <Stack.Screen name="WeatherAlerts" component={WeatherAlerts} />
            <Stack.Screen name="GovernmentSchemes" component={GovernmentSchemes} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
            <Stack.Screen name="Chatbot" component={Chatbot} />
            </>
          ) : (
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen 
                  {...props} 
                  onLogin={handleLogin}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
        <NetworkStatus />
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default App;