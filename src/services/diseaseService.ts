// Disease service for Crop Doctor functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class DiseaseService {
  private baseURL = `${API_BASE_URL}/diseases`;

  async analyzeDisease(formData: FormData) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Disease analysis failed');
      }

      return data;
    } catch (error) {
      console.error('Disease analysis error:', error);
      throw error;
    }
  }

  async getDiseaseReports(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get disease reports');
      }

      return data;
    } catch (error) {
      console.error('Get disease reports error:', error);
      throw error;
    }
  }

  async getDiseaseReport(reportId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get disease report');
      }

      return data;
    } catch (error) {
      console.error('Get disease report error:', error);
      throw error;
    }
  }

  async saveDiseaseReport(reportData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save disease report');
      }

      return data;
    } catch (error) {
      console.error('Save disease report error:', error);
      throw error;
    }
  }

  async updateDiseaseReport(reportId: string, updateData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update disease report');
      }

      return data;
    } catch (error) {
      console.error('Update disease report error:', error);
      throw error;
    }
  }

  async deleteDiseaseReport(reportId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete disease report');
      }

      return data;
    } catch (error) {
      console.error('Delete disease report error:', error);
      throw error;
    }
  }

  async addExpertReview(reportId: string, reviewData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}/expert-review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add expert review');
      }

      return data;
    } catch (error) {
      console.error('Add expert review error:', error);
      throw error;
    }
  }

  async scheduleFollowUp(reportId: string, followUpData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}/follow-up`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followUpData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule follow-up');
      }

      return data;
    } catch (error) {
      console.error('Schedule follow-up error:', error);
      throw error;
    }
  }

  async addFeedback(reportId: string, feedbackData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${reportId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add feedback');
      }

      return data;
    } catch (error) {
      console.error('Add feedback error:', error);
      throw error;
    }
  }

  async getPublicDiseaseReports(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/public/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get public disease reports');
      }

      return data;
    } catch (error) {
      console.error('Get public disease reports error:', error);
      throw error;
    }
  }

  async getDiseaseStatistics(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/stats/summary?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get disease statistics');
      }

      return data;
    } catch (error) {
      console.error('Get disease statistics error:', error);
      throw error;
    }
  }
}

export const diseaseService = new DiseaseService();
