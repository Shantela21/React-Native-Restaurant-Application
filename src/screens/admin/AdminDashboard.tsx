import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import {
  addFoodItem,
  deleteFoodItem,
  getFoodItems,
  getOrders,
  getRestaurantInfo,
  updateFoodItem,
} from '../../services/firebaseService';

interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  description: string;
}

// Local food item interface that matches Firebase structure
interface FoodItemWithId {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  createdAt: any; // Timestamp from Firebase
  updatedAt: any; // Timestamp from Firebase
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'food' | 'restaurant' | 'orders'>('overview');
  const [foodItems, setFoodItems] = useState<FoodItemWithId[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>({
    name: 'Foodie Restaurant',
    address: '123 Main St, City',
    phone: '+27 12 345 6789',
    email: 'info@foodie.com',
    openingHours: 'Mon-Sun: 9AM-10PM',
    description: 'Delicious food delivered fast',
  });
  const [editingFood, setEditingFood] = useState<FoodItemWithId | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load food items from Firebase
    const foodResult = await getFoodItems();
    if (foodResult.success) {
      setFoodItems(foodResult.data);
    }

    // Load orders from Firebase
    const ordersResult = await getOrders();
    if (ordersResult.success) {
      setOrders(ordersResult.data);
    }

    // Load restaurant info from Firebase
    const restaurantResult = await getRestaurantInfo();
    if (restaurantResult.success && restaurantResult.data) {
      setRestaurantInfo({
        name: restaurantResult.data.name,
        address: restaurantResult.data.address,
        phone: restaurantResult.data.phone,
        email: restaurantResult.data.email,
        openingHours: restaurantResult.data.openingHours,
        description: restaurantResult.data.description,
      });
    }
  };

  const updateRestaurantInfo = (field: keyof RestaurantInfo, value: string) => {
    setRestaurantInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveRestaurantInfo = () => {
    Alert.alert('Success', 'Restaurant information updated successfully!');
  };

  const handleAddFoodItem = async (foodItem: FoodItemWithId) => {
    console.log('handleAddFoodItem called with:', foodItem);
    try {
      // Remove id, createdAt, updatedAt if it's a new item (Firebase will generate them)
      const { id, createdAt, updatedAt, ...foodItemData } = foodItem;
      console.log('foodItemData to send to Firebase:', foodItemData);
      const result = await addFoodItem(foodItemData);
      console.log('addFoodItem result:', result);
      if (result.success) {
        // Reload data to get the updated list
        await loadData();
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Food item added successfully! 🎉',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to add food item',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Add food item error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while adding the food item',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const handleUpdateFoodItem = async (updatedItem: FoodItemWithId) => {
    console.log('handleUpdateFoodItem called with:', updatedItem);
    try {
      const result = await updateFoodItem(updatedItem.id, updatedItem);
      console.log('updateFoodItem result:', result);
      if (result.success) {
        // Reload data to get the updated list
        await loadData();
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Food item updated successfully! ✏️',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update food item',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Update food item error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while updating the food item',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const handleDeleteFoodItem = async (id: string) => {
    console.log('Delete function called for ID:', id);
    console.log('Current foodItems:', foodItems);
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            console.log('Delete confirmed for ID:', id);
            try {
              console.log('Calling deleteFoodItem with ID:', id);
              const result = await deleteFoodItem(id);
              console.log('Delete result:', result);
              if (result.success) {
                console.log('Delete successful, reloading data');
                // Reload data to get the updated list
                await loadData();
                Toast.show({
                  type: 'success',
                  text1: 'Success!',
                  text2: 'Food item deleted successfully! 🗑️',
                  position: 'top',
                  visibilityTime: 3000,
                });
              } else {
                console.log('Delete failed:', result);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to delete food item',
                  position: 'top',
                  visibilityTime: 3000,
                });
              }
            } catch (error) {
              console.error('Delete error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while deleting the food item',
                position: 'top',
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setEditingFood(prev => prev ? { ...prev, image: imageUri } : {
          id: Date.now().toString(),
          name: '',
          price: 0,
          category: 'mains',
          description: '',
          image: imageUri,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{foodItems.length}</Text>
          <Text style={styles.statLabel}>Food Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            R{orders.reduce((sum, order) => sum + order.total, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Order Status Distribution</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>Delivered: {orders.filter(o => o.status === 'delivered').length}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.warning }]} />
            <Text style={styles.legendText}>Preparing: {orders.filter(o => o.status === 'preparing').length}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Ready: {orders.filter(o => o.status === 'ready').length}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Pending: {orders.filter(o => o.status === 'pending').length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderFoodTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.foodHeader}>
        <Text style={styles.foodTitle}>Food Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFood(true)}
        >
          <Ionicons name="add" size={20} color={Colors.surface} />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {showAddFood && (
        <View style={styles.addFoodForm}>
          <Text style={styles.formTitle}>Add New Food Item</Text>
          
          {/* Image Picker Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              {editingFood?.image ? (
                <Image source={{ uri: editingFood.image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={Colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>Add Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Food Name"
            value={editingFood?.name || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, name: value } : { id: Date.now().toString(), name: value, price: 0, category: 'mains', description: '', image: '', createdAt: new Date(), updatedAt: new Date() })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (R)"
            value={editingFood?.price?.toString() || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, price: parseFloat(value) || 0 } : { id: Date.now().toString(), name: '', price: parseFloat(value) || 0, category: 'mains', description: '', image: '', createdAt: new Date(), updatedAt: new Date() })}
            keyboardType="numeric"
          />
          <View style={styles.categoryContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryButtons}>
              {['mains', 'starters', 'desserts', 'beverages', 'alcohol', 'burgers'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    editingFood?.category === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => setEditingFood(prev => prev ? { ...prev, category } : { id: Date.now().toString(), name: '', price: 0, category, description: '', image: '', createdAt: new Date(), updatedAt: new Date() })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    editingFood?.category === category && styles.categoryButtonTextSelected
                  ]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={editingFood?.description || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, description: value } : null)}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAddFood(false);
                setEditingFood(null);
              }}
            >
              <Text style={styles.formButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={async () => {
                console.log('Save button pressed');
                console.log('editingFood:', editingFood);
                
                if (editingFood) {
                  console.log('editingFood exists, checking if update or add');
                  console.log('editingFood.id:', editingFood.id);
                  console.log('foodItems:', foodItems);
                  
                  if (editingFood.id && foodItems.some(item => item.id === editingFood.id)) {
                    console.log('Updating existing item');
                    // Update existing item
                    await handleUpdateFoodItem(editingFood);
                  } else {
                    console.log('Adding new item');
                    // Add new item
                    await handleAddFoodItem(editingFood);
                  }
                  // Clear form after successful save
                  console.log('Clearing form');
                  setEditingFood(null);
                  setShowAddFood(false);
                } else {
                  console.log('No editingFood data available');
                }
              }}
            >
              <Text style={styles.formButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={foodItems}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Image source={{ uri: item.image }} style={styles.foodImage} />
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodPrice}>R{item.price}</Text>
              <Text style={styles.foodCategory}>{item.category}</Text>
            </View>
            <View style={styles.foodActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setEditingFood(item);
                  setShowAddFood(true);
                }}
              >
                <Ionicons name="create" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteFoodItem(item.id)}
              >
                <Ionicons name="trash" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.foodList}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );

  const renderRestaurantTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Restaurant Information</Text>
      <View style={styles.infoForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            value={restaurantInfo.name}
            onChangeText={(value) => updateRestaurantInfo('name', value)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.input}
            value={restaurantInfo.address}
            onChangeText={(value) => updateRestaurantInfo('address', value)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={restaurantInfo.phone}
            onChangeText={(value) => updateRestaurantInfo('phone', value)}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={restaurantInfo.email}
            onChangeText={(value) => updateRestaurantInfo('email', value)}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Opening Hours</Text>
          <TextInput
            style={styles.input}
            value={restaurantInfo.openingHours}
            onChangeText={(value) => updateRestaurantInfo('openingHours', value)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={restaurantInfo.description}
            onChangeText={(value) => updateRestaurantInfo('description', value)}
            multiline
            numberOfLines={3}
          />
        </View>
        <TouchableOpacity
          style={styles.saveButtonContainer}
          onPress={saveRestaurantInfo}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderOrdersTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Order History</Text>
      {orders.map((order) => (
        <View key={order.id} style={styles.orderItem}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Order #{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
            <View style={[styles.statusBadge, {
              backgroundColor: order.status === 'delivered' ? Colors.success :
                           order.status === 'preparing' ? Colors.warning :
                           order.status === 'ready' ? Colors.primary : Colors.error
            }]}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.orderItems}>{order.items.join(', ')}</Text>
            <Text style={styles.orderTotal}>R{order.total}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.primaryGradient as any}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'Admin'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {['overview', 'food', 'restaurant', 'orders'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Ionicons 
              name={
                tab === 'overview' ? 'bar-chart' :
                tab === 'food' ? 'restaurant' :
                tab === 'restaurant' ? 'business' : 'list'
              } 
              size={16} 
              color={activeTab === tab ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'food' && renderFoodTab()}
      {activeTab === 'restaurant' && renderRestaurantTab()}
      {activeTab === 'orders' && renderOrdersTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    color: Colors.surface,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: -12,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.surface,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
  },
  statNumber: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  chartContainer: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
  },
  chartTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlayLight,
    backgroundColor: Colors.surface,
  },
  foodTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: Typography.sm,
    fontWeight: '600',
    marginLeft: 8,
  },
  addFoodForm: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  formTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.base,
    color: Colors.text,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: Colors.textLight,
    shadowColor: Colors.textLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  formButtonText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.surface,
  },
  foodList: {
    padding: 20,
  },
  foodItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  foodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  infoForm: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  saveButtonContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.surface,
  },
  orderItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.text,
  },
  orderDate: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.surface,
  },
  orderDetails: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  orderItems: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textLight,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: Typography.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: Colors.surface,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
