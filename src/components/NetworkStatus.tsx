import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { offlineStorageService } from '../services/offlineStorageService';

interface NetworkStatusProps {
  onRetry?: () => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Listen to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      
      if (!online) {
        setShowStatus(true);
        slideIn();
      } else {
        // Check for pending items
        const syncStatus = offlineStorageService.getSyncStatus();
        if (syncStatus.pendingItems > 0) {
          setPendingItems(syncStatus.pendingItems);
          setShowStatus(true);
          slideIn();
        } else {
          slideOut();
        }
      }
    });

    // Check initial network state
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Check for pending items
    const syncStatus = offlineStorageService.getSyncStatus();
    setPendingItems(syncStatus.pendingItems);

    return unsubscribe;
  }, []);

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowStatus(false);
    });
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    
    if (isOnline && pendingItems > 0) {
      offlineStorageService.syncPendingData();
    }
  };

  const handleDismiss = () => {
    slideOut();
  };

  if (!showStatus) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <Ionicons
            name={isOnline ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={20}
            color={isOnline ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.statusText}>
            {isOnline
              ? `Syncing ${pendingItems} items...`
              : 'You are offline. Changes will sync when connected.'
            }
          </Text>
        </View>

        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons name="refresh" size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButton: {
    padding: 8,
    marginRight: 8,
  },
  dismissButton: {
    padding: 8,
  },
});

export default NetworkStatus;
