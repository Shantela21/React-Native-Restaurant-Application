import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unsubscribeCart, setUnsubscribeCart] = useState<(() => void) | null>(null);

  // Load cart from Firestore when user changes or on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      console.log('Auth state changed:', user?.uid || 'No user');
      
      // Unsubscribe from previous cart listener
      if (unsubscribeCart) {
        unsubscribeCart();
        setUnsubscribeCart(null);
      }
      
      if (user) {
        setCurrentUserId(user.uid);
        loadCartFromFirestore(user.uid);
      } else {
        setCurrentUserId(null);
        // Clear cart when user logs out
        setItems([]);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Save cart to AsyncStorage whenever items change (FIRESTORE DISABLED DUE TO QUOTA)
  useEffect(() => {
    // TEMPORARY FALLBACK TO ASYNCSTORAGE - Firebase quota exceeded
    if (!isLoading && currentUserId) {
      const timeoutId = setTimeout(() => {
        saveCartToAsyncStorage(currentUserId);
      }, 500); // Quick save to AsyncStorage

      return () => clearTimeout(timeoutId);
    }
  }, [items, isLoading, currentUserId]);

  // Clean up blob URLs and local file URIs when loading cart
  const cleanCartItems = (items: CartItem[]): CartItem[] => {
    return items.map(item => ({
      ...item,
      // Remove blob URLs and local file URIs as they're invalid after app refresh
      image: item.image && (item.image.startsWith('blob:') || item.image.startsWith('file://')) ? '' : item.image || ''
    }));
  };

  const loadCartFromFirestore = async (userId: string) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(cartRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const cartData = docSnapshot.data();
          const cartItems = cartData.items || [];
          const cleanedCart = cleanCartItems(cartItems);
          setItems(cleanedCart);
          console.log(`Loaded ${cleanedCart.length} items for user ${userId} from Firestore`);
        } else {
          // No cart in Firestore, try AsyncStorage fallback
          loadCartFromAsyncStorage(userId);
        }
        setIsLoading(false);
      }, (error) => {
        console.error('Error loading cart from Firestore:', error);
        // Fallback to AsyncStorage on Firestore error
        loadCartFromAsyncStorage(userId);
      });

      setUnsubscribeCart(() => unsubscribe);
    } catch (error) {
      console.error('Error setting up cart listener:', error);
      // Fallback to AsyncStorage on setup error
      loadCartFromAsyncStorage(userId);
    }
  };

  // Fallback: Load cart from AsyncStorage
  const loadCartFromAsyncStorage = async (userId: string) => {
    try {
      const userCartKey = `@foodie_cart_${userId}`;
      const savedCart = await AsyncStorage.getItem(userCartKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const cleanedCart = cleanCartItems(parsedCart);
        setItems(cleanedCart);
        console.log(`Loaded ${cleanedCart.length} items for user ${userId} from AsyncStorage (fallback)`);
      } else {
        setItems([]);
        console.log(`No cart found for user ${userId} in AsyncStorage`);
      }
    } catch (error) {
      console.error('Error loading cart from AsyncStorage:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToFirestore = async (userId: string) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartData = {
        userId: userId,
        items: items,
        updatedAt: new Date(),
        isActive: true
      };
      
      await setDoc(cartRef, cartData);
      console.log(`Saved ${items.length} items for user ${userId} to Firestore`);
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
    }
  };

  // TEMPORARY FALLBACK: Save to AsyncStorage when Firestore quota is exceeded
  const saveCartToAsyncStorage = async (userId: string) => {
    try {
      const userCartKey = `@foodie_cart_${userId}`;
      await AsyncStorage.setItem(userCartKey, JSON.stringify(items));
      console.log(`Saved ${items.length} items for user ${userId} to AsyncStorage (fallback)`);
    } catch (error) {
      console.error('Error saving cart to AsyncStorage:', error);
    }
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item => {
          if (item.id === newItem.id) {
            const newQuantity = item.quantity + 1;
            // Recalculate total price for existing item
            const basePrice = item.price;
            const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
            const selectedSidesTotal = item.selectedSides?.reduce((sum, side) => sum + side.price, 0) || 0;
            const selectedDrinksTotal = item.selectedDrinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
            const selectedExtrasTotal = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
            
            const itemTotalPrice = (basePrice + extrasTotal + selectedSidesTotal + selectedDrinksTotal + selectedExtrasTotal) * newQuantity;
            
            return { ...item, quantity: newQuantity, totalPrice: itemTotalPrice };
          }
          return item;
        });
      } else {
        // Calculate total price for new item
        const basePrice = newItem.price;
        const extrasTotal = newItem.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
        const selectedSidesTotal = newItem.selectedSides?.reduce((sum, side) => sum + side.price, 0) || 0;
        const selectedDrinksTotal = newItem.selectedDrinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
        const selectedExtrasTotal = newItem.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
        
        const itemTotalPrice = basePrice + extrasTotal + selectedSidesTotal + selectedDrinksTotal + selectedExtrasTotal;
        
        return [...prevItems, { ...newItem, quantity: 1, totalPrice: itemTotalPrice }];
      }
    });
  };

  const addItemWithQuantity = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item => {
          if (item.id === newItem.id) {
            const newQuantity = item.quantity + quantity;
            // Recalculate total price for existing item
            const basePrice = item.price;
            const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
            const selectedSidesTotal = item.selectedSides?.reduce((sum, side) => sum + side.price, 0) || 0;
            const selectedDrinksTotal = item.selectedDrinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
            const selectedExtrasTotal = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
            
            const itemTotalPrice = (basePrice + extrasTotal + selectedSidesTotal + selectedDrinksTotal + selectedExtrasTotal) * newQuantity;
            
            return { ...item, quantity: newQuantity, totalPrice: itemTotalPrice };
          }
          return item;
        });
      } else {
        // Calculate total price for new item
        const basePrice = newItem.price;
        const extrasTotal = newItem.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
        const selectedSidesTotal = newItem.selectedSides?.reduce((sum, side) => sum + side.price, 0) || 0;
        const selectedDrinksTotal = newItem.selectedDrinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
        const selectedExtrasTotal = newItem.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
        
        const itemTotalPrice = (basePrice + extrasTotal + selectedSidesTotal + selectedDrinksTotal + selectedExtrasTotal) * quantity;
        
        return [...prevItems, { ...newItem, quantity, totalPrice: itemTotalPrice }];
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
      prevItems.map(item => {
        if (item.id === id) {
          // Recalculate the total price based on the new quantity
          const basePrice = item.price;
          const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
          const selectedSidesTotal = item.selectedSides?.reduce((sum, side) => sum + side.price, 0) || 0;
          const selectedDrinksTotal = item.selectedDrinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
          const selectedExtrasTotal = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
          
          const itemTotalPrice = (basePrice + extrasTotal + selectedSidesTotal + selectedDrinksTotal + selectedExtrasTotal) * quantity;
          
          return { ...item, quantity, totalPrice: itemTotalPrice };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    console.log('=== CLEAR CART FUNCTION CALLED ===');
    console.log('Current items before clear:', items.length);
    setItems([]);
    console.log('Items set to empty array');
    
    // Clear from Firestore for current user
    if (currentUserId) {
      saveCartToFirestore(currentUserId); // This will save empty cart to Firestore
      console.log(`Cart cleared for user ${currentUserId} in Firestore`);
    }
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
