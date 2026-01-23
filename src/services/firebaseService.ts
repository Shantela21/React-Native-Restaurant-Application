import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Food Item interface for Firebase
export interface FirebaseFoodItem {
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order interface for Firebase
export interface FirebaseOrder {
  customerName: string;
  items: string[];
  total: number;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Restaurant info interface for Firebase
export interface FirebaseRestaurantInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  description: string;
  updatedAt: Timestamp;
}

// Food Items CRUD operations
export const foodItemsCollection = collection(db, 'foodItems');

export const addFoodItem = async (foodItem: Omit<FirebaseFoodItem, 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(foodItemsCollection, {
      ...foodItem,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding food item:', error);
    return { success: false, error: error as Error };
  }
};

export const getFoodItems = async () => {
  try {
    const querySnapshot = await getDocs(foodItemsCollection);
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (FirebaseFoodItem & { id: string })[];
    return { success: true, data: items };
  } catch (error) {
    console.error('Error getting food items:', error);
    return { success: false, error: error as Error, data: [] };
  }
};

export const updateFoodItem = async (id: string, foodItem: Partial<FirebaseFoodItem>) => {
  try {
    const docRef = doc(db, 'foodItems', id);
    await updateDoc(docRef, {
      ...foodItem,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating food item:', error);
    return { success: false, error: error as Error };
  }
};

export const deleteFoodItem = async (id: string) => {
  try {
    console.log('Attempting to delete document with ID:', id);
    const docRef = doc(db, 'foodItems', id);
    console.log('Document reference created:', docRef);
    
    // Check if document exists before deleting
    const docSnap = await getDoc(docRef);
    console.log('Document exists:', docSnap.exists());
    
    if (docSnap.exists()) {
      console.log('Document data before delete:', docSnap.data());
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
      return { success: true };
    } else {
      console.log('Document does not exist');
      return { success: false, error: new Error('Document does not exist') };
    }
  } catch (error) {
    console.error('Error deleting food item:', error);
    return { success: false, error: error as Error };
  }
};

// Orders CRUD operations
export const ordersCollection = collection(db, 'orders');

export const getOrders = async () => {
  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (FirebaseOrder & { id: string })[];
    return { success: true, data: orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: error as Error, data: [] };
  }
};

export const updateOrderStatus = async (id: string, status: FirebaseOrder['status']) => {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error as Error };
  }
};

// Restaurant info operations
export const restaurantInfoCollection = collection(db, 'restaurantInfo');

export const getRestaurantInfo = async () => {
  try {
    const querySnapshot = await getDocs(restaurantInfoCollection);
    const info = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (FirebaseRestaurantInfo & { id: string })[];
    return { success: true, data: info[0] || null };
  } catch (error) {
    console.error('Error getting restaurant info:', error);
    return { success: false, error: error as Error, data: null };
  }
};

export const updateRestaurantInfo = async (id: string, info: Partial<FirebaseRestaurantInfo>) => {
  try {
    const docRef = doc(db, 'restaurantInfo', id);
    await updateDoc(docRef, {
      ...info,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    return { success: false, error: error as Error };
  }
};
