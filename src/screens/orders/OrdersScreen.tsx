import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { Order, orderService } from '../../services/orderService';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      if (user) {
        console.log('Fetching orders for user:', user.uid);
        const userOrders = await orderService.getUserOrders(user.uid);
        console.log('User orders fetched:', userOrders);
        console.log('User orders count:', userOrders.length);
        setOrders(userOrders);
      } else {
        console.log('No user found for fetching orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'confirmed':
        return Colors.primary;
      case 'preparing':
        return Colors.secondary;
      case 'ready':
        return Colors.success;
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>
            {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.orderItems}>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
          <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.deliveryAddress} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
          <Text style={styles.paymentMethod}>
            {item.paymentMethod === 'cash' ? 'Cash' : 'Card'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start ordering to see your order history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textLight,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.text,
    fontFamily: Typography.fontFamily.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: 16,
    fontFamily: Typography.fontFamily.medium,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Typography.fontFamily.regular,
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    fontFamily: Typography.fontFamily.medium,
  },
  orderDate: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: Typography.fontFamily.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.surface,
    fontFamily: Typography.fontFamily.medium,
  },
  orderContent: {
    gap: 8,
  },
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  totalAmount: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  orderDetails: {
    gap: 4,
  },
  deliveryAddress: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  paymentMethod: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
});
