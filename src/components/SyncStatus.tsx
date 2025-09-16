import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface SyncStatusProps {
  status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  style?: any;
}

export default function SyncStatus({ status, style }: SyncStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing with CouchDB...';
      case 'synced':
        return 'All changes synced';
      case 'offline':
        return 'Offline - Changes saved locally';
      case 'error':
        return 'Sync error - Will retry';
      case 'idle':
      default:
        return 'Initializing sync...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return '#FFA500';
      case 'synced':
        return '#4CAF50';
      case 'offline':
        return '#9E9E9E';
      case 'error':
        return '#F44336';
      case 'idle':
      default:
        return '#2196F3';
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'syncing':
        return <ActivityIndicator size="small" color="#FFA500" />;
      case 'synced':
        return <Icon name="cloud-done" size={20} color="#4CAF50" />;
      case 'offline':
        return <Icon name="cloud-off" size={20} color="#9E9E9E" />;
      case 'error':
        return <Icon name="error-outline" size={20} color="#F44336" />;
      default:
        return <Icon name="cloud-queue" size={20} color="#2196F3" />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        {renderIcon()}
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(), marginLeft: 8 },
          ]}
        >
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
}
