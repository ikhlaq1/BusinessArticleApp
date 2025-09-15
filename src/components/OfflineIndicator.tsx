import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { styles } from './styles';

export default function OfflineIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected && state.isInternetReachable;
      const wasOffline = isConnected === false;
      setIsConnected(connected);

      console.log('Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      // Show "Back Online" message briefly when reconnecting
      if (wasOffline && connected) {
        setShowOnlineMessage(true);
        setTimeout(() => {
          setShowOnlineMessage(false);
        }, 2000);
      }
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  // Don't render anything initially
  if (isConnected === null) {
    return null;
  }

  // Only show if offline or showing online message
  if (isConnected === true && !showOnlineMessage) {
    return null;
  }

  return (
    <View
      style={[styles.container, isConnected ? styles.online : styles.offline]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.dot,
            isConnected ? styles.dotOnline : styles.dotOffline,
          ]}
        />
        <Text style={styles.text}>
          {isConnected ? '✓ Back Online' : 'Offline Mode'}
        </Text>
        {!isConnected && (
          <Text style={styles.subtext}>Data will sync when reconnected</Text>
        )}
      </View>
    </View>
  );
}
