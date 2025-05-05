import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpCuUqqLVnq8teUwjRTTYi9Jha99sihYM",
  authDomain: "prepify-bf9c6.firebaseapp.com",
  projectId: "prepify-bf9c6",
  storageBucket: "prepify-bf9c6.firebasestorage.app",
  messagingSenderId: "613861385794",
  appId: "1:613861385794:web:6634f820c35286144a2fdb",
  measurementId: "G-NQ4H28QZEK",
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
