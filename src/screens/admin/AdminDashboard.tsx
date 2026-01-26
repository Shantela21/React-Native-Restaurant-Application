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
  getRestaurantInfo,
  getUsers,
  updateFoodItem
} from '../../services/firebaseService';
import { Order, orderService } from '../../services/orderService';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  createdAt: any;
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
  const [users, setUsers] = useState<User[]>([]);
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

    // Load orders from Firebase using orderService
    const ordersData = await orderService.getAllOrders();
    console.log('Orders loaded in admin dashboard:', ordersData);
    console.log('Orders count:', ordersData.length);
    setOrders(ordersData);

    // Load users from Firebase
    const usersResult = await getUsers();
    if (usersResult.success) {
      setUsers(usersResult.data);
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
        quality: 0.8, // Reduced quality for better compatibility
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Image URI picked:', imageUri);
        
        // Validate URI format
        if (!imageUri || imageUri.trim() === '') {
          Alert.alert('Error', 'Invalid image URI');
          return;
        }

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
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Key Metrics Section */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.primaryStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="restaurant" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.statNumber}>{foodItems.length}</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
            <Text style={styles.statChange}>Available now</Text>
          </View>
          <View style={[styles.statCard, styles.successStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cart" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statChange}>All time</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.infoStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Customers</Text>
            <Text style={styles.statChange}>Registered users</Text>
          </View>
          <View style={[styles.statCard, styles.warningStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.statNumber}>
              R{orders.reduce((sum, order) => sum + order.totalAmount, 0)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statChange}>Total sales</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => setShowAddFood(true)}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={28} color="#6366F1" />
            </View>
            <Text style={styles.quickActionTitle}>Add Item</Text>
            <Text style={styles.quickActionSubtitle}>New menu item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="bar-chart" size={28} color="#10B981" />
            </View>
            <Text style={styles.quickActionTitle}>Analytics</Text>
            <Text style={styles.quickActionSubtitle}>View reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="notifications" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionTitle}>Notifications</Text>
            <Text style={styles.quickActionSubtitle}>Send alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings" size={28} color="#EF4444" />
            </View>
            <Text style={styles.quickActionTitle}>Settings</Text>
            <Text style={styles.quickActionSubtitle}>Configure</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Status Overview */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Order Status Overview</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
            <View style={styles.statusContent}>
              <Text style={styles.statusNumber}>{orders.filter(o => o.status === 'delivered').length}</Text>
              <Text style={styles.statusText}>Delivered</Text>
            </View>
            <View style={styles.statusPercentage}>
              <Text style={styles.percentageText}>
                {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
              </Text>
            </View>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.statusContent}>
              <Text style={styles.statusNumber}>{orders.filter(o => o.status === 'preparing').length}</Text>
              <Text style={styles.statusText}>Preparing</Text>
            </View>
            <View style={styles.statusPercentage}>
              <Text style={styles.percentageText}>
                {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'preparing').length / orders.length) * 100) : 0}%
              </Text>
            </View>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: '#6366F1' }]} />
            <View style={styles.statusContent}>
              <Text style={styles.statusNumber}>{orders.filter(o => o.status === 'ready').length}</Text>
              <Text style={styles.statusText}>Ready</Text>
            </View>
            <View style={styles.statusPercentage}>
              <Text style={styles.percentageText}>
                {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'ready').length / orders.length) * 100) : 0}%
              </Text>
            </View>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: '#EF4444' }]} />
            <View style={styles.statusContent}>
              <Text style={styles.statusNumber}>{orders.filter(o => o.status === 'pending').length}</Text>
              <Text style={styles.statusText}>Pending</Text>
            </View>
            <View style={styles.statusPercentage}>
              <Text style={styles.percentageText}>
                {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'pending').length / orders.length) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {orders.length > 0 && orders.slice(-3).reverse().map((order, index) => (
            <View key={order.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="checkmark" size={16} color={Colors.surface} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New order placed</Text>
                <Text style={styles.activitySubtitle}>Order #{order.id} - R{order.totalAmount}.00</Text>
              </View>
              <Text style={styles.activityTime}>Just now</Text>
            </View>
          ))}
          {users.length > 0 && users.slice(-2).reverse().map((user, index) => (
            <View key={user.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="person-add" size={16} color={Colors.surface} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New customer registered</Text>
                <Text style={styles.activitySubtitle}>{user.email}</Text>
              </View>
              <Text style={styles.activityTime}>Just now</Text>
            </View>
          ))}
          {foodItems.length > 0 && foodItems.slice(-1).reverse().map((item, index) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="star" size={16} color={Colors.surface} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New menu item added</Text>
                <Text style={styles.activitySubtitle}>{item.name}</Text>
              </View>
              <Text style={styles.activityTime}>Just now</Text>
            </View>
          ))}
          {orders.length === 0 && users.length === 0 && foodItems.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No recent activity</Text>
              <Text style={styles.emptyActivitySubtext}>Activity will appear here when users interact with the app</Text>
            </View>
          )}
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
              {editingFood?.image && editingFood.image.trim() !== '' ? (
                <Image 
                  source={{ uri: editingFood.image }} 
                  style={styles.previewImage}
                  onError={() => console.log('Image failed to load:', editingFood.image)}
                  onLoad={() => console.log('Image loaded successfully:', editingFood.image)}
                />
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
            <Image 
                source={{ 
                  uri: item.image && item.image.trim() !== '' 
                    ? item.image 
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                }} 
                style={styles.foodImage}
                onError={() => console.log('Food list image failed to load:', item.image)}
                onLoad={() => console.log('Food list image loaded:', item.image)}
              />
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
            <Text style={styles.orderDate}>{order.createdAt.toLocaleDateString()}</Text>
            <View style={[styles.statusBadge, {
              backgroundColor: order.status === 'delivered' ? Colors.success :
                           order.status === 'preparing' ? Colors.warning :
                           order.status === 'ready' ? Colors.primary : Colors.error
            }]}>
              <Text style={styles.statusText}>{order.status ? order.status.toUpperCase() : 'UNKNOWN'}</Text>
            </View>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.customerName}>User ID: {order.userId || 'Unknown'}</Text>
            <Text style={styles.orderItems}>{order.items && order.items.length > 0 ? order.items.map(item => item.name).join(', ') : 'No items'}</Text>
            <Text style={styles.orderTotal}>R{order.totalAmount || 0}</Text>
            <Text style={styles.deliveryAddress}>📍 {order.deliveryAddress || 'No address'}</Text>
            <Text style={styles.paymentMethod}>💳 {order.paymentMethod === 'card' ? 'Card' : order.paymentMethod === 'cash' ? 'Cash' : 'Unknown'}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    borderRadius: 20,
    marginTop: -16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 3,
  },
  activeTab: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: Colors.surface,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Section Styles
  metricsSection: {
    padding: 24,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  chartSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  activitySection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: 0.3,
  },

  // Enhanced Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryStat: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  successStat: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoStat: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  warningStat: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.05)',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Enhanced Chart Section
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 6,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.05)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statusPercentage: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },

  // Activity Section
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.05)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyActivity: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.05)',
  },
  emptyActivityText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.1)',
    backgroundColor: Colors.surface,
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  addFoodForm: {
    backgroundColor: Colors.surface,
    margin: 24,
    padding: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.3,
  },
  foodList: {
    padding: 24,
  },
  foodItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  foodImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '700',
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
  // Missing styles for admin dashboard
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
    marginLeft: 8,
  },
  infoForm: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  deliveryAddress: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});
