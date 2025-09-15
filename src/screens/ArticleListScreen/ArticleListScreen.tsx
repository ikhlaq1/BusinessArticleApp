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
import { useRoute, RouteProp } from '@react-navigation/native';
import { DatabaseService } from '../../database';
import { Article } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { styles } from './styles';

type ArticleListRouteProp = RouteProp<RootStackParamList, 'ArticleList'>;

export default function ArticleListScreen() {
  const route = useRoute<ArticleListRouteProp>();
  const { business } = route.params;

  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newArticle, setNewArticle] = useState({
    name: '',
    qty: '',
    selling_price: '',
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const businessArticles = await DatabaseService.getArticlesByBusiness(
        business.id,
      );
      setArticles(businessArticles);
      console.log(
        `Loaded ${businessArticles.length} articles for business ${business.name}`,
      );
    } catch (error) {
      console.error('Failed to load articles:', error);
      Alert.alert('Error', 'Failed to load articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArticles();
  }, []);

  const handleCreateArticle = async () => {
    // Validate inputs
    if (!newArticle.name.trim()) {
      Alert.alert('Error', 'Please enter article name');
      return;
    }
    if (
      !newArticle.qty ||
      isNaN(Number(newArticle.qty)) ||
      Number(newArticle.qty) < 0
    ) {
      Alert.alert('Error', 'Please enter valid quantity (0 or more)');
      return;
    }
    if (
      !newArticle.selling_price ||
      isNaN(Number(newArticle.selling_price)) ||
      Number(newArticle.selling_price) < 0
    ) {
      Alert.alert('Error', 'Please enter valid price (0 or more)');
      return;
    }

    try {
      console.log('Creating article for business:', business.name);
      await DatabaseService.createArticle(
        newArticle.name.trim(),
        parseInt(newArticle.qty),
        parseFloat(newArticle.selling_price),
        business.id,
      );

      // Reset form and close modal
      setNewArticle({ name: '', qty: '', selling_price: '' });
      setModalVisible(false);

      // Reload list
      await loadArticles();

      Alert.alert('Success', 'Article created successfully');
    } catch (error) {
      console.error('Failed to create article:', error);
      Alert.alert('Error', 'Failed to create article');
    }
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <View style={styles.articleCard}>
      <View style={styles.articleHeader}>
        <Text style={styles.articleName}>{item.name}</Text>
        <Text style={styles.articlePrice}>
          ${item.selling_price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.articleDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{item.qty}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Value:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            ${(item.qty * item.selling_price).toFixed(2)}
          </Text>
        </View>
      </View>
      <Text style={styles.articleId}>ID: {item.id}</Text>
      <Text style={styles.articleDate}>
        Added: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No articles yet</Text>
      <Text style={styles.emptySubtext}>Tap the + button to add articles</Text>
    </View>
  );

  const getTotalInventoryValue = () => {
    return articles
      .reduce((total, article) => {
        return total + article.qty * article.selling_price;
      }, 0)
      .toFixed(2);
  };

  const getTotalQuantity = () => {
    return articles.reduce((total, article) => total + article.qty, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {articles.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Articles</Text>
            <Text style={styles.summaryValue}>{articles.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Quantity</Text>
            <Text style={styles.summaryValue}>{getTotalQuantity()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Inventory Value</Text>
            <Text style={styles.summaryValue}>${getTotalInventoryValue()}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={renderArticleItem}
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

      {/* Create Article Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Article</Text>
            <Text style={styles.modalSubtitle}>for {business.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="Article Name"
              value={newArticle.name}
              onChangeText={text =>
                setNewArticle({ ...newArticle, name: text })
              }
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g., 10)"
              value={newArticle.qty}
              onChangeText={text => setNewArticle({ ...newArticle, qty: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Selling Price (e.g., 29.99)"
              value={newArticle.selling_price}
              onChangeText={text =>
                setNewArticle({ ...newArticle, selling_price: text })
              }
              keyboardType="decimal-pad"
            />

            {/* Preview */}
            {newArticle.qty && newArticle.selling_price && (
              <View style={styles.preview}>
                <Text style={styles.previewText}>
                  Total Value: $
                  {(
                    parseInt(newArticle.qty || '0') *
                    parseFloat(newArticle.selling_price || '0')
                  ).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewArticle({ name: '', qty: '', selling_price: '' });
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateArticle}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>
                  Add Article
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
