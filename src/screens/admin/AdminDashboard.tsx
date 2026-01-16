import { Ionicons } from '@expo/vector-icons';
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
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { getFoodItems, getOrders, getRestaurantInfo } from '@/src/services/firebaseService';

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

interface SimpleFoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'food' | 'restaurant' | 'orders'>('overview');
  const [foodItems, setFoodItems] = useState<SimpleFoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>({
    name: 'Foodie Restaurant',
    address: '123 Main St, City',
    phone: '+27 12 345 6789',
    email: 'info@foodie.com',
    openingHours: 'Mon-Sun: 9AM-10PM',
    description: 'Delicious food delivered fast',
  });
  const [editingFood, setEditingFood] = useState<SimpleFoodItem | null>(null);
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

  const addFoodItem = (foodItem: Omit<SimpleFoodItem, 'id'>) => {
    const newItem = { ...foodItem, id: Date.now().toString() } as SimpleFoodItem;
    setFoodItems(prev => [...prev, newItem]);
    setShowAddFood(false);
    Alert.alert('Success', 'Food item added successfully!');
  };

  const updateFoodItem = (updatedItem: SimpleFoodItem) => {
    setFoodItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingFood(null);
    Alert.alert('Success', 'Food item updated successfully!');
  };

  const deleteFoodItem = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setFoodItems(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'Food item deleted successfully!');
        }}
      ]
    );
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
    <View style={styles.tabContent}>
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
          <TextInput
            style={styles.input}
            placeholder="Food Name"
            value={editingFood?.name || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, name: value } : { id: Date.now().toString(), name: value, price: 0, category: 'mains', description: '', image: '' })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (R)"
            value={editingFood?.price?.toString() || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, price: parseFloat(value) || 0 } : { id: Date.now().toString(), name: '', price: parseFloat(value) || 0, category: 'mains', description: '', image: '' })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={editingFood?.category || ''}
            onChangeText={(value) => setEditingFood(prev => prev ? { ...prev, category: value } : { id: Date.now().toString(), name: '', price: 0, category: value, description: '', image: '' })}
          />
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
              onPress={() => editingFood && addFoodItem(editingFood)}
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
                onPress={() => setEditingFood(item)}
              >
                <Ionicons name="create" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteFoodItem(item.id)}
              >
                <Ionicons name="trash" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.foodList}
      />
    </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    color: Colors.surface,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlayLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: Colors.primary,
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
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  foodTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: Typography.sm,
    fontWeight: '600',
    marginLeft: 6,
  },
  addFoodForm: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 8,
    padding: 12,
    fontSize: Typography.base,
    color: Colors.text,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.textLight,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
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
});
