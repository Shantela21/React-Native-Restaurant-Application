import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firebase services
export {
    addDoc, collection, db, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where
};

export default app;
