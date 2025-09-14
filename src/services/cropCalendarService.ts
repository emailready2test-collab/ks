// Crop Calendar service for managing farming activities and schedules
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface Activity {
  _id: string;
  title: string;
  description: string;
  type: 'planting' | 'irrigation' | 'fertilizing' | 'pest_control' | 'harvesting' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  cropId: string;
  cropName: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Crop {
  _id: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  area: number; // in acres
  location: string;
  soilType: string;
  irrigationMethod: string;
  status: 'planning' | 'planted' | 'growing' | 'harvesting' | 'harvested';
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  _id: string;
  title: string;
  date: string;
  type: 'activity' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  cropId?: string;
  activityId?: string;
  isCompleted: boolean;
  createdAt: string;
}

class CropCalendarService {
  private baseURL = `${API_BASE_URL}/calendar`;

  // Activities CRUD operations
  async getActivities(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/activities?${queryParams}`, {
        method: 'GET',
        headers: {
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
      const response = await fetch(`${this.baseURL}/activities/${activityId}`, {
        method: 'GET',
        headers: {
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

  async createActivity(activityData: Partial<Activity>) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities`, {
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

  async updateActivity(activityId: string, updateData: Partial<Activity>) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities/${activityId}`, {
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
      
      const response = await fetch(`${this.baseURL}/activities/${activityId}`, {
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

  async markActivityComplete(activityId: string, completionData: { completedDate: string; actualDuration?: number; notes?: string }) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities/${activityId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark activity complete');
      }

      return data;
    } catch (error) {
      console.error('Mark activity complete error:', error);
      throw error;
    }
  }

  // Crops CRUD operations
  async getCrops() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/crops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get crops');
      }

      return data;
    } catch (error) {
      console.error('Get crops error:', error);
      throw error;
    }
  }

  async createCrop(cropData: Partial<Crop>) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/crops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create crop');
      }

      return data;
    } catch (error) {
      console.error('Create crop error:', error);
      throw error;
    }
  }

  // Calendar operations
  async getCalendarEvents(startDate: string, endDate: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/events?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get calendar events');
      }

      return data;
    } catch (error) {
      console.error('Get calendar events error:', error);
      throw error;
    }
  }

  async getUpcomingActivities(days: number = 7) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities/upcoming?days=${days}`, {
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

  async getOverdueActivities() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities/overdue`, {
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

  async getActivityStats() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/activities/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get activity stats');
      }

      return data;
    } catch (error) {
      console.error('Get activity stats error:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockActivities(): Activity[] {
    return [
      {
        _id: '1',
        title: 'Prepare soil for rice planting',
        description: 'Plow and level the field, add organic manure',
        type: 'planting',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-02-15T08:00:00Z',
        cropId: 'crop1',
        cropName: 'Rice - Basmati',
        estimatedDuration: 4,
        notes: 'Ensure proper drainage',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: '2',
        title: 'Apply NPK fertilizer',
        description: 'Apply 50kg NPK fertilizer per acre',
        type: 'fertilizing',
        priority: 'medium',
        status: 'completed',
        dueDate: '2024-02-10T08:00:00Z',
        completedDate: '2024-02-10T10:30:00Z',
        cropId: 'crop1',
        cropName: 'Rice - Basmati',
        estimatedDuration: 2,
        actualDuration: 2.5,
        notes: 'Applied evenly across the field',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-10T10:30:00Z'
      },
      {
        _id: '3',
        title: 'Irrigation - First watering',
        description: 'Provide initial irrigation after planting',
        type: 'irrigation',
        priority: 'urgent',
        status: 'overdue',
        dueDate: '2024-02-05T08:00:00Z',
        cropId: 'crop1',
        cropName: 'Rice - Basmati',
        estimatedDuration: 3,
        notes: 'Monitor water level carefully',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: '4',
        title: 'Pest control - Aphid treatment',
        description: 'Spray neem oil for aphid control',
        type: 'pest_control',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2024-02-20T08:00:00Z',
        cropId: 'crop2',
        cropName: 'Wheat - Durum',
        estimatedDuration: 2,
        notes: 'Use organic pesticides only',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        _id: '5',
        title: 'Harvest preparation',
        description: 'Prepare harvesting equipment and storage',
        type: 'harvesting',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-03-15T08:00:00Z',
        cropId: 'crop1',
        cropName: 'Rice - Basmati',
        estimatedDuration: 6,
        notes: 'Check weather forecast before harvesting',
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z'
      }
    ];
  }

  getMockCrops(): Crop[] {
    return [
      {
        _id: 'crop1',
        name: 'Rice - Basmati',
        variety: 'Basmati 370',
        plantingDate: '2024-02-15T08:00:00Z',
        expectedHarvestDate: '2024-06-15T08:00:00Z',
        area: 2.5,
        location: 'Field A - North Section',
        soilType: 'Clay Loam',
        irrigationMethod: 'Flood Irrigation',
        status: 'planted',
        activities: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: 'crop2',
        name: 'Wheat - Durum',
        variety: 'Durum Wheat',
        plantingDate: '2024-01-20T08:00:00Z',
        expectedHarvestDate: '2024-04-20T08:00:00Z',
        area: 1.8,
        location: 'Field B - South Section',
        soilType: 'Sandy Loam',
        irrigationMethod: 'Drip Irrigation',
        status: 'growing',
        activities: [],
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];
  }

  getMockCalendarEvents(): CalendarEvent[] {
    return [
      {
        _id: 'event1',
        title: 'Soil Preparation Due',
        date: '2024-02-15T08:00:00Z',
        type: 'activity',
        priority: 'high',
        description: 'Prepare soil for rice planting',
        cropId: 'crop1',
        activityId: '1',
        isCompleted: false,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: 'event2',
        title: 'Fertilizer Application',
        date: '2024-02-10T08:00:00Z',
        type: 'activity',
        priority: 'medium',
        description: 'Apply NPK fertilizer',
        cropId: 'crop1',
        activityId: '2',
        isCompleted: true,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: 'event3',
        title: 'Weather Alert',
        date: '2024-02-18T08:00:00Z',
        type: 'alert',
        priority: 'urgent',
        description: 'Heavy rainfall expected - postpone irrigation',
        isCompleted: false,
        createdAt: '2024-02-17T10:00:00Z'
      }
    ];
  }
}

export const cropCalendarService = new CropCalendarService();
export type { Activity, Crop, CalendarEvent };
