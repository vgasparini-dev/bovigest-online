// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCn_eHREYCqtCxOtM4ShWmW_O--AX-605I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fluent-radar-319304.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fluent-radar-319304",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fluent-radar-319304.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "518852852793",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:518852852793:web:a062b7edf3d9e47b6eb3e8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { signInAnonymously, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, collection, getDocs, addDoc };
