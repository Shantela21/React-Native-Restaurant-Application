
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  paymentMethod: 'cash' | 'card';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

class OrderService {
  async placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderResponse> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return {
          success: false,
          message: 'User must be logged in to place an order'
        };
      }

      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        userId: currentUser.uid,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(doc(db, "orders", newOrder.id), newOrder);

      return {
        success: true,
        order: newOrder,
        message: 'Order placed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to place order'
      };
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(ordersQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data()
        } as Order;
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching order:", error);
      return undefined;
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<OrderResponse> {
    try {
      const orderRef = doc(db, "orders", orderId);
      
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
      });

      // Get updated order
      const updatedOrder = await this.getOrderById(orderId);

      return {
        success: true,
        order: updatedOrder,
        message: 'Order status updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update order status'
      };
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(ordersQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  }
}

export const orderService = new OrderService();
