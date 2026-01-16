import { authService } from './authService';
import { Order } from './foodService';

export interface OrderResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

class OrderService {
  private orders: Order[] = [];

  async placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'User must be logged in to place an order'
        };
      }

      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        userId: currentUser.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.orders.push(newOrder);

      return {
        success: true,
        order: newOrder,
        message: 'Order placed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to place order'
      };
    }
  }

  getUserOrders(userId: string): Order[] {
    return this.orders
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  updateOrderStatus(orderId: string, status: Order['status']): OrderResponse {
    try {
      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        return {
          success: false,
          message: 'Order not found'
        };
      }

      this.orders[orderIndex] = {
        ...this.orders[orderIndex],
        status,
        updatedAt: new Date(),
      };

      return {
        success: true,
        order: this.orders[orderIndex],
        message: 'Order status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update order status'
      };
    }
  }

  getAllOrders(): Order[] {
    return this.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const orderService = new OrderService();
