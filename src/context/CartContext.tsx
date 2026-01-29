import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'mains' | 'starters' | 'desserts' | 'beverages' | 'alcohol' | 'burgers';
  image: string;
  ingredients: Array<{
    id: string;
    name: string;
    removable?: boolean;
  }>;
  sideOptions?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  drinkOptions?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  extras: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  quantity: number;
  selectedSides?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  selectedDrinks?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  selectedExtras?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  customIngredients?: Array<{
    id: string;
    name: string;
    removable?: boolean;
  }>;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  addItemWithQuantity: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isLoading: boolean;
}

const CART_STORAGE_KEY = '@foodie_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      saveCart();
    }
  }, [items, isLoading]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  const addItemWithQuantity = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from AsyncStorage immediately
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch(error => {
      console.error('Error clearing cart from storage:', error);
    });
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
      return total + itemTotal + (extrasTotal * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    addItemWithQuantity,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
