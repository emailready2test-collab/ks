// Alerts service for managing weather alerts and government schemes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface WeatherAlert {
  _id: string;
  title: string;
  description: string;
  type: 'rain' | 'drought' | 'storm' | 'heat' | 'cold' | 'wind' | 'flood' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  recommendations: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface GovernmentScheme {
  _id: string;
  title: string;
  description: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'training' | 'equipment' | 'other';
  department: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string[];
  requiredDocuments: string[];
  deadline?: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettings {
  weatherAlerts: boolean;
  governmentSchemes: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  alertTypes: string[];
  schemeCategories: string[];
}

class AlertsService {
  private baseURL = `${API_BASE_URL}/alerts`;

  // Weather Alerts CRUD operations
  async getWeatherAlerts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/weather?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get weather alerts');
      }

      return data;
    } catch (error) {
      console.error('Get weather alerts error:', error);
      throw error;
    }
  }

  async getWeatherAlert(alertId: string) {
    try {
      const response = await fetch(`${this.baseURL}/weather/${alertId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get weather alert');
      }

      return data;
    } catch (error) {
      console.error('Get weather alert error:', error);
      throw error;
    }
  }

  async getActiveWeatherAlerts() {
    try {
      const response = await fetch(`${this.baseURL}/weather/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get active weather alerts');
      }

      return data;
    } catch (error) {
      console.error('Get active weather alerts error:', error);
      throw error;
    }
  }

  // Government Schemes CRUD operations
  async getGovernmentSchemes(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/schemes?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get government schemes');
      }

      return data;
    } catch (error) {
      console.error('Get government schemes error:', error);
      throw error;
    }
  }

  async getGovernmentScheme(schemeId: string) {
    try {
      const response = await fetch(`${this.baseURL}/schemes/${schemeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get government scheme');
      }

      return data;
    } catch (error) {
      console.error('Get government scheme error:', error);
      throw error;
    }
  }

  async getActiveGovernmentSchemes() {
    try {
      const response = await fetch(`${this.baseURL}/schemes/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get active government schemes');
      }

      return data;
    } catch (error) {
      console.error('Get active government schemes error:', error);
      throw error;
    }
  }

  // Notification settings
  async getNotificationSettings() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/notifications/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get notification settings');
      }

      return data;
    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update notification settings');
      }

      return data;
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  }

  // Push notifications
  async registerForPushNotifications() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/notifications/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for push notifications');
      }

      return data;
    } catch (error) {
      console.error('Register push notifications error:', error);
      throw error;
    }
  }

  async unregisterFromPushNotifications() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/notifications/unregister`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unregister from push notifications');
      }

      return data;
    } catch (error) {
      console.error('Unregister push notifications error:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockWeatherAlerts(): WeatherAlert[] {
    return [
      {
        _id: '1',
        title: 'Heavy Rainfall Warning',
        description: 'Heavy rainfall expected in the next 24 hours. Take necessary precautions for your crops.',
        type: 'rain',
        severity: 'high',
        location: 'Kerala, India',
        startDate: '2024-02-20T00:00:00Z',
        endDate: '2024-02-21T00:00:00Z',
        isActive: true,
        recommendations: [
          'Cover sensitive crops with protective sheets',
          'Ensure proper drainage in fields',
          'Avoid irrigation during heavy rainfall',
          'Monitor for waterlogging'
        ],
        source: 'IMD (India Meteorological Department)',
        createdAt: '2024-02-19T10:00:00Z',
        updatedAt: '2024-02-19T10:00:00Z'
      },
      {
        _id: '2',
        title: 'Heat Wave Alert',
        description: 'Temperature expected to rise above 40°C in the coming days.',
        type: 'heat',
        severity: 'medium',
        location: 'North India',
        startDate: '2024-02-25T00:00:00Z',
        endDate: '2024-02-28T00:00:00Z',
        isActive: true,
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade to sensitive crops',
          'Apply mulch to retain soil moisture',
          'Monitor soil moisture levels'
        ],
        source: 'IMD (India Meteorological Department)',
        createdAt: '2024-02-24T10:00:00Z',
        updatedAt: '2024-02-24T10:00:00Z'
      },
      {
        _id: '3',
        title: 'Drought Warning',
        description: 'Below normal rainfall expected for the next 2 weeks.',
        type: 'drought',
        severity: 'critical',
        location: 'South India',
        startDate: '2024-03-01T00:00:00Z',
        endDate: '2024-03-15T00:00:00Z',
        isActive: true,
        recommendations: [
          'Implement water conservation measures',
          'Use drought-resistant crop varieties',
          'Consider drip irrigation systems',
          'Reduce water-intensive activities'
        ],
        source: 'IMD (India Meteorological Department)',
        createdAt: '2024-02-28T10:00:00Z',
        updatedAt: '2024-02-28T10:00:00Z'
      }
    ];
  }

  getMockGovernmentSchemes(): GovernmentScheme[] {
    return [
      {
        _id: '1',
        title: 'PM-KISAN Scheme',
        description: 'Direct income support scheme for farmers providing ₹6,000 per year.',
        category: 'subsidy',
        department: 'Ministry of Agriculture & Farmers Welfare',
        eligibility: [
          'Small and marginal farmers',
          'Landholding up to 2 hectares',
          'Valid land records'
        ],
        benefits: [
          '₹6,000 per year in three installments',
          'Direct bank transfer',
          'No middlemen involved'
        ],
        applicationProcess: [
          'Visit nearest Common Service Centre (CSC)',
          'Submit required documents',
          'Get Aadhaar verification',
          'Receive confirmation'
        ],
        requiredDocuments: [
          'Aadhaar Card',
          'Land records',
          'Bank account details',
          'Mobile number'
        ],
        deadline: '2024-12-31T23:59:59Z',
        contactInfo: {
          phone: '1800-180-1551',
          website: 'https://pmkisan.gov.in',
          email: 'support@pmkisan.gov.in'
        },
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        _id: '2',
        title: 'Kisan Credit Card (KCC)',
        description: 'Credit card for farmers to meet their agricultural and allied activities.',
        category: 'loan',
        department: 'Reserve Bank of India',
        eligibility: [
          'Farmers engaged in agricultural activities',
          'Age between 18-75 years',
          'Valid land documents'
        ],
        benefits: [
          'Low interest rates (4% per annum)',
          'Flexible repayment options',
          'Insurance coverage included',
          'ATM facility available'
        ],
        applicationProcess: [
          'Visit nearest bank branch',
          'Fill application form',
          'Submit required documents',
          'Get credit limit approval'
        ],
        requiredDocuments: [
          'Identity proof',
          'Address proof',
          'Land documents',
          'Income certificate',
          'Passport size photographs'
        ],
        contactInfo: {
          phone: '1800-425-1551',
          website: 'https://rbi.org.in',
          email: 'support@rbi.org.in'
        },
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        _id: '3',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Crop insurance scheme to provide financial support to farmers.',
        category: 'insurance',
        department: 'Ministry of Agriculture & Farmers Welfare',
        eligibility: [
          'All farmers growing notified crops',
          'Landholding up to 2 hectares',
          'Valid land records'
        ],
        benefits: [
          'Premium subsidy up to 90%',
          'Comprehensive risk coverage',
          'Quick claim settlement',
          'Weather-based insurance'
        ],
        applicationProcess: [
          'Visit nearest bank or insurance company',
          'Fill application form',
          'Pay premium',
          'Get insurance certificate'
        ],
        requiredDocuments: [
          'Aadhaar Card',
          'Land records',
          'Bank account details',
          'Crop details'
        ],
        deadline: '2024-06-30T23:59:59Z',
        contactInfo: {
          phone: '1800-180-1551',
          website: 'https://pmfby.gov.in',
          email: 'support@pmfby.gov.in'
        },
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }
    ];
  }

  getMockNotificationSettings(): NotificationSettings {
    return {
      weatherAlerts: true,
      governmentSchemes: true,
      pushNotifications: true,
      emailNotifications: false,
      smsNotifications: false,
      alertTypes: ['rain', 'drought', 'storm', 'heat'],
      schemeCategories: ['subsidy', 'loan', 'insurance']
    };
  }
}

export const alertsService = new AlertsService();
export type { WeatherAlert, GovernmentScheme, NotificationSettings };
