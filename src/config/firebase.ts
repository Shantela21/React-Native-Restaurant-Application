// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlmubIlH1oD1Kjmu9RT2uCwYTSPgn8Hv4",
  authDomain: "reactnativerestuarantapp.firebaseapp.com",
  projectId: "reactnativerestuarantapp",
  storageBucket: "reactnativerestuarantapp.appspot.com",
  messagingSenderId: "842238739226",
  appId: "1:842238739226:web:4da6b0292a4d4208f562a3",
  measurementId: "G-F9E4E67TZY",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
