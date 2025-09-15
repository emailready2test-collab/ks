// Offline storage service for managing local data and sync
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
  action: 'create' | 'update' | 'delete';
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingItems: number;
  syncInProgress: boolean;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private lastSync: number = 0;
  private pendingItems: number = 0;

  // Storage keys
  private static STORAGE_KEYS = {
    OFFLINE_DATA: 'offline_data',
    SYNC_STATUS: 'sync_status',
    USER_DATA: 'user_data',
    CACHE_DATA: 'cache_data',
  };

  // Data types for offline storage
  private static DATA_TYPES = {
    USER_PROFILE: 'user_profile',
    CROP_INFO: 'crop_info',
    WEATHER_DATA: 'weather_data',
    GOVERNMENT_SCHEMES: 'government_schemes',
    KNOWLEDGE_BASE: 'knowledge_base',
    COMMUNITY_POSTS: 'community_posts',
    ACTIVITIES: 'activities',
    DISEASE_REPORTS: 'disease_reports',
    CHAT_HISTORY: 'chat_history',
  };

  constructor() {
    this.initializeNetworkListener();
    this.loadSyncStatus();
  }

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Initialize network listener
  private async initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline && this.pendingItems > 0) {
        this.syncPendingData();
      }
    });
  }

  // Load sync status from storage
  private async loadSyncStatus() {
    try {
      const syncStatus = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.SYNC_STATUS);
      if (syncStatus) {
        const status = JSON.parse(syncStatus);
        this.lastSync = status.lastSync || 0;
        this.pendingItems = status.pendingItems || 0;
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }

  // Save sync status to storage
  private async saveSyncStatus() {
    try {
      const status = {
        lastSync: this.lastSync,
        pendingItems: this.pendingItems,
        syncInProgress: this.syncInProgress,
      };
      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.SYNC_STATUS,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }

  // Store data offline
  async storeOffline(type: string, data: any, action: 'create' | 'update' | 'delete' = 'create'): Promise<string> {
    try {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineData: OfflineData = {
        id,
        type,
        data,
        timestamp: Date.now(),
        synced: false,
        action,
      };

      const existingData = await this.getOfflineData();
      existingData.push(offlineData);
      
      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(existingData)
      );

      this.pendingItems++;
      await this.saveSyncStatus();

      return id;
    } catch (error) {
      console.error('Error storing offline data:', error);
      throw error;
    }
  }

  // Get offline data
  async getOfflineData(): Promise<OfflineData[]> {
    try {
      const data = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  }

  // Get offline data by type
  async getOfflineDataByType(type: string): Promise<OfflineData[]> {
    try {
      const allData = await this.getOfflineData();
      return allData.filter(item => item.type === type);
    } catch (error) {
      console.error('Error getting offline data by type:', error);
      return [];
    }
  }

  // Mark data as synced
  async markAsSynced(id: string): Promise<void> {
    try {
      const allData = await this.getOfflineData();
      const updatedData = allData.map(item => {
        if (item.id === id) {
          return { ...item, synced: true };
        }
        return item;
      });

      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(updatedData)
      );

      this.pendingItems = Math.max(0, this.pendingItems - 1);
      await this.saveSyncStatus();
    } catch (error) {
      console.error('Error marking data as synced:', error);
    }
  }

  // Remove synced data
  async removeSyncedData(): Promise<void> {
    try {
      const allData = await this.getOfflineData();
      const unsyncedData = allData.filter(item => !item.synced);
      
      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(unsyncedData)
      );

      this.pendingItems = unsyncedData.length;
      await this.saveSyncStatus();
    } catch (error) {
      console.error('Error removing synced data:', error);
    }
  }

  // Cache data for offline access
  async cacheData(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      const existingCache = await this.getCachedData();
      existingCache[key] = cacheItem;

      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.CACHE_DATA,
        JSON.stringify(existingCache)
      );
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data
  async getCachedData(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.CACHE_DATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting cached data:', error);
      return {};
    }
  }

  // Get cached data by key
  async getCachedDataByKey(key: string): Promise<any> {
    try {
      const cache = await this.getCachedData();
      const item = cache[key];
      
      if (!item) {
        return null;
      }

      // Check if cache is expired
      if (Date.now() - item.timestamp > item.ttl) {
        // Remove expired cache
        delete cache[key];
        await AsyncStorage.setItem(
          OfflineStorageService.STORAGE_KEYS.CACHE_DATA,
          JSON.stringify(cache)
        );
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error getting cached data by key:', error);
      return null;
    }
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    try {
      const cache = await this.getCachedData();
      const now = Date.now();
      const validCache: Record<string, any> = {};

      for (const [key, item] of Object.entries(cache)) {
        if (now - item.timestamp <= item.ttl) {
          validCache[key] = item;
        }
      }

      await AsyncStorage.setItem(
        OfflineStorageService.STORAGE_KEYS.CACHE_DATA,
        JSON.stringify(validCache)
      );
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Sync pending data
  async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    try {
      this.syncInProgress = true;
      const pendingData = await this.getOfflineData();
      const unsyncedData = pendingData.filter(item => !item.synced);

      for (const item of unsyncedData) {
        try {
          // Here you would implement the actual sync logic
          // For now, we'll just mark as synced
          await this.markAsSynced(item.id);
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }

      this.lastSync = Date.now();
      await this.saveSyncStatus();
    } catch (error) {
      console.error('Error syncing pending data:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingItems: this.pendingItems,
      syncInProgress: this.syncInProgress,
    };
  }

  // Clear all offline data
  async clearAllOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA);
      await AsyncStorage.removeItem(OfflineStorageService.STORAGE_KEYS.CACHE_DATA);
      await AsyncStorage.removeItem(OfflineStorageService.STORAGE_KEYS.SYNC_STATUS);
      
      this.pendingItems = 0;
      this.lastSync = 0;
      this.syncInProgress = false;
      
      await this.saveSyncStatus();
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{
    totalSize: number;
    offlineDataSize: number;
    cacheDataSize: number;
    userDataSize: number;
  }> {
    try {
      const offlineData = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.OFFLINE_DATA);
      const cacheData = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.CACHE_DATA);
      const userData = await AsyncStorage.getItem(OfflineStorageService.STORAGE_KEYS.USER_DATA);

      const offlineDataSize = offlineData ? offlineData.length : 0;
      const cacheDataSize = cacheData ? cacheData.length : 0;
      const userDataSize = userData ? userData.length : 0;
      const totalSize = offlineDataSize + cacheDataSize + userDataSize;

      return {
        totalSize,
        offlineDataSize,
        cacheDataSize,
        userDataSize,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return {
        totalSize: 0,
        offlineDataSize: 0,
        cacheDataSize: 0,
        userDataSize: 0,
      };
    }
  }

  // Data type constants are available via OfflineStorageService.DATA_TYPES
}

export const offlineStorageService = OfflineStorageService.getInstance();
export default OfflineStorageService;
