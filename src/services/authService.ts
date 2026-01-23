import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

/* =======================
   Types
======================= */

export interface CardDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  cardType: "visa" | "mastercard" | "amex" | "discover";
}

export interface User {
  uid: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  password:string;
  cardDetails?: CardDetails; // ✅ optional
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/* =======================
   Auth Service
======================= */

class AuthService {
  getCurrentUser() {
      throw new Error('Method not implemented.');
  }
  /* -------- Register -------- */
  async register(data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }): Promise<AuthResponse> {
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // 2. Save profile in Firestore
      const userProfile: Omit<User, "uid"> = {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password:data.password
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userProfile,
        createdAt: new Date(),
      });

      return {
        success: true,
        user: {
          uid: firebaseUser.uid,
          ...userProfile,
        },
        message: "Registration successful",
      };
    } catch (error: any) {
      console.error("Register error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: "This email is already registered. Please try logging in instead.",
        };
      } else if (error.code === 'auth/weak-password') {
        return {
          success: false,
          message: "Password is too weak. Please use a stronger password.",
        };
      } else if (error.code === 'auth/invalid-email') {
        return {
          success: false,
          message: "Invalid email address. Please check your email format.",
        };
      } else {
        return {
          success: false,
          message: error.message || "Registration failed",
        };
      }
    }
  }

  /* -------- Login -------- */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // 1. Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // 2. Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "User profile not found",
        };
      }

      return {
        success: true,
        user: {
          uid: firebaseUser.uid,
          ...(userDoc.data() as Omit<User, "uid">),
        },
        message: "Login successful",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Invalid email or password",
      };
    }
  }

  /* -------- Logout -------- */
  async logout(): Promise<void> {
    await signOut(auth);
  }
}

export const authService = new AuthService();
export default authService;