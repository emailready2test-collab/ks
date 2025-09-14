// Weather service for weather data
import { API_BASE_URL } from '../config/api';

class WeatherService {
  private baseURL = `${API_BASE_URL}/weather`;

  async getCurrentWeather(latitude?: number, longitude?: number) {
    try {
      // If coordinates not provided, try to get from device location
      if (!latitude || !longitude) {
        const location = await this.getCurrentLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      const response = await fetch(`${this.baseURL}/current?lat=${latitude}&lon=${longitude}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get weather data');
      }

      return data.data;
    } catch (error) {
      console.error('Get current weather error:', error);
      throw error;
    }
  }

  async getWeatherForecast(latitude?: number, longitude?: number, days: number = 7) {
    try {
      // If coordinates not provided, try to get from device location
      if (!latitude || !longitude) {
        const location = await this.getCurrentLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      const response = await fetch(`${this.baseURL}/forecast?lat=${latitude}&lon=${longitude}&days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get weather forecast');
      }

      return data.data;
    } catch (error) {
      console.error('Get weather forecast error:', error);
      throw error;
    }
  }

  async getWeatherAlerts(latitude?: number, longitude?: number) {
    try {
      // If coordinates not provided, try to get from device location
      if (!latitude || !longitude) {
        const location = await this.getCurrentLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      const response = await fetch(`${this.baseURL}/alerts?lat=${latitude}&lon=${longitude}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get weather alerts');
      }

      return data.data;
    } catch (error) {
      console.error('Get weather alerts error:', error);
      throw error;
    }
  }

  async getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to a location in India if geolocation fails
          resolve({
            latitude: 20.5937,
            longitude: 78.9629
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  // Mock weather data for development/testing
  getMockWeatherData() {
    return {
      temperature: 28,
      humidity: 65,
      condition: 'Partly Cloudy',
      windSpeed: 12,
      rainfall: 0,
      pressure: 1013,
      visibility: 10,
      uvIndex: 6,
      location: {
        name: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777
      },
      timestamp: new Date().toISOString()
    };
  }

  getMockWeatherForecast() {
    const forecast = [];
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.floor(Math.random() * 10) + 20,
          max: Math.floor(Math.random() * 10) + 30
        },
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 15) + 5,
        rainfall: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
        icon: 'partly-cloudy-day'
      });
    }
    
    return forecast;
  }

  getMockWeatherAlerts() {
    return [
      {
        id: '1',
        type: 'rain',
        severity: 'moderate',
        title: 'Heavy Rain Expected',
        description: 'Heavy rainfall is expected in your area for the next 2 days. Take necessary precautions for your crops.',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai, India',
        recommendations: [
          'Cover sensitive crops with protective sheets',
          'Ensure proper drainage in fields',
          'Avoid spraying pesticides during rain'
        ]
      },
      {
        id: '2',
        type: 'temperature',
        severity: 'high',
        title: 'High Temperature Alert',
        description: 'Temperature is expected to rise above 35°C for the next 3 days.',
        startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai, India',
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade for young plants',
          'Monitor soil moisture levels'
        ]
      }
    ];
  }
}

export const weatherService = new WeatherService();
