import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../config/firebase";

// Types
interface UserProfile {
  cardDetails?: any;
  uid: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  register: (
    data: Omit<UserProfile, "uid"> & { password: string }
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Omit<UserProfile, "uid" | "email">>
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => ({ success: false }),
  login: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => ({ success: false }),
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider
interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({ uid: firebaseUser.uid, ...(docSnap.data() as any) });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register
  const register = async (
    data: Omit<UserProfile, "uid"> & { password: string }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const firebaseUser = userCredential.user;

      // Save user profile in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdAt: new Date(),
      });

      setUser({
        uid: firebaseUser.uid,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cardDetails: null,
      });

      return { success: true, message: "Registration successful" };
    } catch (error: any) {
      console.log("Register error:", error);
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({ uid: firebaseUser.uid, ...(docSnap.data() as any) });
      }

      return { success: true, message: "Login successful" };
    } catch (error: any) {
      console.log("Login error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        return {
          success: false,
          message: "No account found with this email. Please register first.",
        };
      } else if (error.code === 'auth/wrong-password') {
        return {
          success: false,
          message: "Incorrect password. Please try again.",
        };
      } else if (error.code === 'auth/invalid-credential') {
        return {
          success: false,
          message: "Invalid email or password. Please check your credentials.",
        };
      } else if (error.code === 'auth/invalid-email') {
        return {
          success: false,
          message: "Invalid email address format.",
        };
      } else if (error.code === 'auth/user-disabled') {
        return {
          success: false,
          message: "This account has been disabled. Please contact support.",
        };
      } else if (error.code === 'auth/too-many-requests') {
        return {
          success: false,
          message: "Too many failed attempts. Please try again later.",
        };
      } else {
        return {
          success: false,
          message: error.message || "Login failed",
        };
      }
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('Firebase signOut successful');
    } catch (error) {
      console.error('Firebase signOut error:', error);
      // Force logout even if Firebase signOut fails
      setUser(null);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (
    updates: Partial<Omit<UserProfile, "uid" | "email">>
  ) => {
    if (!user) return { success: false, message: "No user logged in" };
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updates);

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      return { success: true, message: "Profile updated successfully" };
    } catch (error: any) {
      console.log("Update profile error:", error);
      return { success: false, message: error.message || "Update failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
