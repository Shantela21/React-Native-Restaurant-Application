import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category:
    | "mains"
    | "starters"
    | "desserts"
    | "beverages"
    | "alcohol"
    | "burgers";
  image: string;
  ingredients: Array<{ id: string; name: string; removable?: boolean }>;
  sideOptions?: Array<{ id: string; name: string; price: number }>;
  drinkOptions?: Array<{ id: string; name: string; price: number }>;
  extras: Array<{ id: string; name: string; price: number }>;
  quantity: number;
  selectedSides?: Array<{ id: string; name: string; price: number }>;
  selectedDrinks?: Array<{ id: string; name: string; price: number }>;
  selectedExtras?: Array<{ id: string; name: string; price: number }>;
  customIngredients?: Array<{ id: string; name: string; removable?: boolean }>;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  setUserId: (userId: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Load cart for current user
  useEffect(() => {
    if (!userId) return;

    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(`cart_${userId}`);
        if (storedCart) setItems(JSON.parse(storedCart));
      } catch (error) {
        console.log("Error loading cart:", error);
      }
    };
    loadCart();
  }, [userId]);

  // Save cart whenever it changes
  useEffect(() => {
    if (!userId) return;

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(items));
      } catch (error) {
        console.log("Error saving cart:", error);
      }
    };
    saveCart();
  }, [items, userId]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = async () => {
    setItems([]);
    if (!userId) return;
    try {
      await AsyncStorage.removeItem(`cart_${userId}`);
    } catch (error) {
      console.log("Error clearing cart:", error);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const extrasTotal =
        item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
      return total + itemTotal + extrasTotal * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    setUserId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
