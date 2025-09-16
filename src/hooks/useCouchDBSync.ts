import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { startCouchDBSync, stopCouchDBSync } from '../database';

export const useCouchDBSync = () => {
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'synced' | 'offline' | 'error'
  >('idle');
  const [syncHandles, setSyncHandles] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const handleNetworkChange = async (state: any) => {
      if (!mounted) return;

      if (state.isConnected && state.isInternetReachable) {
        if (!syncHandles) {
          setSyncStatus('syncing');

          try {
            const handles = await startCouchDBSync();

            if (mounted) {
              setSyncHandles(handles);
              setSyncStatus('synced');
              console.log('✅ Connected to CouchDB');
            }
          } catch (error) {
            console.error('Failed to start sync:', error);
            if (mounted) {
              setSyncStatus('error');
            }
          }
        }
      } else {
        if (syncHandles) {
          await stopCouchDBSync();
          if (mounted) {
            setSyncHandles(null);
            setSyncStatus('offline');
            console.log('📵 Working offline');
          }
        }
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    NetInfo.fetch().then(handleNetworkChange);

    return () => {
      mounted = false;
      unsubscribe();
      if (syncHandles) {
        stopCouchDBSync();
      }
    };
  }, [syncHandles]);

  return syncStatus;
};
