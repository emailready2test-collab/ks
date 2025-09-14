// Scheme service for government schemes functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class SchemeService {
  private baseURL = `${API_BASE_URL}/schemes`;

  async getSchemes(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get schemes');
      }

      return data;
    } catch (error) {
      console.error('Get schemes error:', error);
      throw error;
    }
  }

  async getScheme(schemeId: string) {
    try {
      const response = await fetch(`${this.baseURL}/${schemeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get scheme');
      }

      return data;
    } catch (error) {
      console.error('Get scheme error:', error);
      throw error;
    }
  }

  async applyForScheme(schemeId: string, applicationData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${schemeId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for scheme');
      }

      return data;
    } catch (error) {
      console.error('Apply for scheme error:', error);
      throw error;
    }
  }

  async getUserApplications(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/applications?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get applications');
      }

      return data;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  }

  async getApplicationStatus(applicationId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/applications/${applicationId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get application status');
      }

      return data;
    } catch (error) {
      console.error('Get application status error:', error);
      throw error;
    }
  }

  async searchSchemes(query: string, params: any = {}) {
    try {
      const searchParams = { ...params, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`${this.baseURL}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search schemes');
      }

      return data;
    } catch (error) {
      console.error('Search schemes error:', error);
      throw error;
    }
  }

  async getSchemeCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get categories');
      }

      return data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async getFeaturedSchemes() {
    try {
      const response = await fetch(`${this.baseURL}/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get featured schemes');
      }

      return data;
    } catch (error) {
      console.error('Get featured schemes error:', error);
      throw error;
    }
  }

  async getSchemeStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get scheme statistics');
      }

      return data;
    } catch (error) {
      console.error('Get scheme statistics error:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockSchemes() {
    return [
      {
        _id: '1',
        title: 'PM Kisan Samman Nidhi',
        description: 'Direct income support scheme for farmers',
        category: 'subsidy',
        benefitAmount: 6000,
        deadline: '2024-12-31',
        eligibility: 'Small and marginal farmers',
        requirements: [
          'Land ownership documents',
          'Aadhaar card',
          'Bank account details',
          'Mobile number'
        ],
        isActive: true,
        detailedDescription: 'PM Kisan Samman Nidhi is a Central Sector Scheme with 100% funding from Government of India. Under this scheme, income support of Rs.6000/- per year is provided to all farmer families across the country.'
      },
      {
        _id: '2',
        title: 'Kisan Credit Card',
        description: 'Credit facility for farmers',
        category: 'loan',
        benefitAmount: 500000,
        deadline: null,
        eligibility: 'All farmers',
        requirements: [
          'Land documents',
          'Income certificate',
          'Bank account',
          'Identity proof'
        ],
        isActive: true,
        detailedDescription: 'Kisan Credit Card provides adequate and timely credit support from the banking system to the farmers for their cultivation and other needs.'
      },
      {
        _id: '3',
        title: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Crop insurance scheme',
        category: 'insurance',
        benefitAmount: 15000,
        deadline: '2024-03-31',
        eligibility: 'All farmers',
        requirements: [
          'Land records',
          'Crop details',
          'Bank account',
          'Premium payment'
        ],
        isActive: true,
        detailedDescription: 'PMFBY aims to support production in agriculture by providing financial support to farmers suffering crop loss/damage arising out of unforeseen events.'
      },
      {
        _id: '4',
        title: 'Soil Health Card Scheme',
        description: 'Free soil testing for farmers',
        category: 'training',
        benefitAmount: 0,
        deadline: null,
        eligibility: 'All farmers',
        requirements: [
          'Land documents',
          'Application form',
          'Soil sample'
        ],
        isActive: true,
        detailedDescription: 'Soil Health Card Scheme aims to provide soil health cards to farmers every 3 years to enable them to apply appropriate recommended dosages of nutrients.'
      },
      {
        _id: '5',
        title: 'Subsidy on Agricultural Equipment',
        description: 'Subsidy on purchase of farm equipment',
        category: 'equipment',
        benefitAmount: 50000,
        deadline: '2024-06-30',
        eligibility: 'Small and marginal farmers',
        requirements: [
          'Land documents',
          'Equipment quotation',
          'Bank account',
          'Identity proof'
        ],
        isActive: true,
        detailedDescription: 'This scheme provides subsidy to farmers for purchasing agricultural equipment like tractors, harvesters, and other farm machinery.'
      }
    ];
  }
}

export const schemeService = new SchemeService();
