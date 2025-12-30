import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi9EOvSmFOVMZTnLcU28_JHqinakVCgvs",
  authDomain: "news-app-e9315.firebaseapp.com",
  projectId: "news-app-e9315",
  storageBucket: "news-app-e9315.appspot.com",
  messagingSenderId: "168033079223",
  appId: "1:168033079223:web:c6eae56c4978e357cf2232",
  measurementId: "G-WPJ9QDDB4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);

// Initialize Firebase Storage and export it
export const storage = getStorage(app);

// Export the Google provider
export const googleProvider = new GoogleAuthProvider();
