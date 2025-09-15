import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { styles } from './styles';

interface SyncStatusProps {
  style?: any;
}

export default function SyncStatus({ style }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline((state.isConnected && state.isInternetReachable) || false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline - Changes saved locally';
    }
    if (isSyncing) {
      return 'Syncing...';
    }
    if (lastSyncTime) {
      const minutes = Math.floor((Date.now() - lastSyncTime.getTime()) / 60000);
      if (minutes < 1) return 'Synced just now';
      if (minutes === 1) return 'Synced 1 minute ago';
      return `Synced ${minutes} minutes ago`;
    }
    return 'Ready to sync';
  };

  const getStatusColor = () => {
    if (!isOnline) return '#ff9800';
    if (isSyncing) return '#2196F3';
    return '#4CAF50';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {isSyncing && (
          <ActivityIndicator
            size="small"
            color="#2196F3"
            style={styles.spinner}
          />
        )}
      </View>
    </View>
  );
}
