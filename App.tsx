/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { initDatabase } from './src/database';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineIndicator from './src/components/OfflineIndicator';
import SyncStatus from './src/components/SyncStatus';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log('App: Starting database initialization...');
      await initDatabase();
      console.log('App: Database initialized successfully ');

      // Load initial data
    } catch (error: any) {
      console.error('App: Database initialization failed:', error);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
      <OfflineIndicator />
      <SyncStatus />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;
