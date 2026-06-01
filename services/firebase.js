// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDemo-ChangeThisToYourRealKey",
  authDomain: "bovigest-online.firebaseapp.com",
  projectId: "bovigest-online",
  storageBucket: "bovigest-online.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { signInAnonymously, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, collection, getDocs, addDoc };
