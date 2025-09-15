import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { DatabaseService } from '../../database';
import { Business } from '../../types';
import { styles } from './styles';

export default function BusinessListScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');

  // Load businesses on mount
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const allBusinesses = await DatabaseService.getAllBusinesses();
      setBusinesses(allBusinesses);
      console.log('Loaded businesses:', allBusinesses.length);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      Alert.alert('Error', 'Failed to load businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBusinesses();
  }, []);

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim()) {
      Alert.alert('Error', 'Please enter a business name');
      return;
    }

    try {
      console.log('Creating business:', newBusinessName);
      await DatabaseService.createBusiness(newBusinessName.trim());

      // Reset form and close modal
      setNewBusinessName('');
      setModalVisible(false);

      // Reload list
      await loadBusinesses();

      Alert.alert('Success', 'Business created successfully');
    } catch (error) {
      console.error('Failed to create business:', error);
      Alert.alert('Error', 'Failed to create business');
    }
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.businessCard}>
      <Text style={styles.businessName}>{item.name}</Text>
      <Text style={styles.businessId}>ID: {item.id}</Text>
      <Text style={styles.businessDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No businesses yet</Text>
      <Text style={styles.emptySubtext}>Tap the + button to create one</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Businesses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={businesses}
        keyExtractor={item => item.id}
        renderItem={renderBusinessItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      {/* Create Business Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Business</Text>

            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={newBusinessName}
              onChangeText={setNewBusinessName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewBusinessName('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateBusiness}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
