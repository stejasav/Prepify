import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpCuUqqLVnq8teUwjRTTYi9Jha99sihYM",
  authDomain: "prepify-bf9c6.firebaseapp.com",
  projectId: "prepify-bf9c6",
  storageBucket: "prepify-bf9c6.firebasestorage.app",
  messagingSenderId: "613861385794",
  appId: "1:613861385794:web:6634f820c35286144a2fdb",
  measurementId: "G-NQ4H28QZEK",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);