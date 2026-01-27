import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
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
      // First try with the indexed query (more efficient)
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(ordersQuery);
        
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firebase Timestamps to JavaScript Dates
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          } as Order;
        });
      } catch (indexError: any) {
        // If index error, fallback to fetching all and filtering client-side
        console.log('Index not found, using fallback method...');
        const allOrdersQuery = query(collection(db, "orders"));
        const querySnapshot = await getDocs(allOrdersQuery);
        
        const allOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          } as Order;
        });
        
        // Filter by userId and sort on client side
        const userOrders = allOrders
          .filter(order => order.userId === userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return userOrders;
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        const data = orderDoc.data();
        // Convert Firebase Timestamps to JavaScript Dates
        return {
          id: orderDoc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
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
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw order data from Firestore:', data);
        
        // Convert Firebase Timestamps to JavaScript Dates
        const order = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        } as Order;
        
        console.log('Processed order:', order);
        return order;
      });
      
      console.log('Final orders array:', orders);
      return orders;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  }
}

export const orderService = new OrderService();
