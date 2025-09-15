/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Button, Alert } from 'react-native';
import { initDatabase, DatabaseService } from './src/database';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [dbStatus, setDbStatus] = useState<string>('Initializing...');
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log('App: Starting database initialization...');
      await initDatabase();
      setDbStatus('Database Connected ✅');
      console.log('App: Database initialized successfully');

      // Load initial data
      await loadBusinesses();
    } catch (error: any) {
      console.error('App: Database initialization failed:', error);
      const errorMessage =
        error?.message || error?.toString() || 'Unknown error';
      setDbStatus(`Database Error: ${errorMessage}`);
    }
  };

  const loadBusinesses = async () => {
    try {
      const allBusinesses = await DatabaseService.getAllBusinesses();
      setBusinesses(allBusinesses);
      console.log('Loaded businesses:', allBusinesses.length);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  };

  const testCreateBusiness = async () => {
    try {
      const businessName = `Test Business ${Date.now()}`;
      console.log('Creating business:', businessName);

      const newBusiness = await DatabaseService.createBusiness(businessName);
      console.log('Business created:', newBusiness);

      Alert.alert('Success', `Created: ${businessName}`);

      // Reload businesses
      await loadBusinesses();
    } catch (error) {
      console.error('Failed to create business:', error);
      Alert.alert('Error', `Failed to create business: ${error}`);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>Business Article App</Text>
          <Text style={styles.subtitle}>Database Test</Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusText}>Status: {dbStatus}</Text>
          </View>

          <View style={styles.section}>
            <Button title="Test Create Business" onPress={testCreateBusiness} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Businesses ({businesses.length})
            </Text>
            {businesses.map((business, index) => (
              <View key={business.id} style={styles.item}>
                <Text>
                  {index + 1}. {business.name}
                </Text>
                <Text style={styles.itemId}>ID: {business.id}</Text>
              </View>
            ))}
            {businesses.length === 0 && (
              <Text style={styles.emptyText}>No businesses yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  statusBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemId: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});

export default App;
