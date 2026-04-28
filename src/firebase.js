// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASOkRTpe5cV20_d1REF7Vij909FGON9wk",
  authDomain: "web-application-umar-x-tooba.firebaseapp.com",
  projectId: "web-application-umar-x-tooba",
  storageBucket: "web-application-umar-x-tooba.firebasestorage.app",
  messagingSenderId: "266841823108",
  appId: "1:266841823108:web:79fc755e8076f3c3bdefd1",
  measurementId: "G-S7JWS75NW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);


export default app;