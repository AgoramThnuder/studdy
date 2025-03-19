import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3Gqlw1m5FcNMm88aCfywDoRkxoyoK66g",
  authDomain: "study-buddy-9dcfe.firebaseapp.com",
  projectId: "study-buddy-9dcfe",
  storageBucket: "study-buddy-9dcfe.firebasestorage.app",
  messagingSenderId: "182507694400",
  appId: "1:182507694400:web:2d89a0b1c26b60c09132a5",
  measurementId: "G-8FDC2E30M4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 