import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DatabaseService } from '../../database';
import { Business } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { styles } from './styles';

type BusinessListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BusinessList'
>;

export default function BusinessListScreen() {
  const navigation = useNavigation<BusinessListNavigationProp>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');

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

      setNewBusinessName('');
      setModalVisible(false);
      await loadBusinesses();

      Alert.alert('Success', 'Business created successfully');
    } catch (error) {
      console.error('Failed to create business:', error);
      Alert.alert('Error', 'Failed to create business');
    }
  };

  const handleBusinessPress = (business: Business) => {
    console.log('🚀 ~ handleBusinessPress ~ business:', business);
    navigation.navigate('ArticleList', { business });
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => handleBusinessPress(item)}
    >
      <Text style={styles.businessName}>{item.name}</Text>
      <Text style={styles.businessId}>ID: {item.id}</Text>
      <Text style={styles.businessDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.tapHint}>Tap to view articles →</Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
