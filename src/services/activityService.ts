// Activity service for activity tracking functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class ActivityService {
  private baseURL = `${API_BASE_URL}/activities`;

  async getActivities(params: any = {}) {
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
        throw new Error(data.message || 'Failed to get activities');
      }

      return data;
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  }

  async getActivity(activityId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get activity');
      }

      return data;
    } catch (error) {
      console.error('Get activity error:', error);
      throw error;
    }
  }

  async createActivity(activityData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create activity');
      }

      return data;
    } catch (error) {
      console.error('Create activity error:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, updateData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update activity');
      }

      return data;
    } catch (error) {
      console.error('Update activity error:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete activity');
      }

      return data;
    } catch (error) {
      console.error('Delete activity error:', error);
      throw error;
    }
  }

  async completeActivity(activityId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete activity');
      }

      return data;
    } catch (error) {
      console.error('Complete activity error:', error);
      throw error;
    }
  }

  async updateProgress(activityId: string, percentage: number) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}/progress`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ percentage }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update progress');
      }

      return data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  async addReminder(activityId: string, reminderData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${activityId}/reminder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add reminder');
      }

      return data;
    } catch (error) {
      console.error('Add reminder error:', error);
      throw error;
    }
  }

  async getActivityStatistics(params: any = {}) {
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
        throw new Error(data.message || 'Failed to get activity statistics');
      }

      return data;
    } catch (error) {
      console.error('Get activity statistics error:', error);
      throw error;
    }
  }

  async getUpcomingActivities(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/upcoming?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get upcoming activities');
      }

      return data;
    } catch (error) {
      console.error('Get upcoming activities error:', error);
      throw error;
    }
  }

  async getOverdueActivities(params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/overdue?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get overdue activities');
      }

      return data;
    } catch (error) {
      console.error('Get overdue activities error:', error);
      throw error;
    }
  }

  async searchActivities(query: string, params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const searchParams = { ...params, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`${this.baseURL}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search activities');
      }

      return data;
    } catch (error) {
      console.error('Search activities error:', error);
      throw error;
    }
  }

  async exportActivities(format: string = 'json', params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams({ ...params, format }).toString();
      
      const response = await fetch(`${this.baseURL}/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to export activities');
      }

      return data;
    } catch (error) {
      console.error('Export activities error:', error);
      throw error;
    }
  }
}

export const activityService = new ActivityService();
