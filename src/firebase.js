import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2XB7DTSPiE0cf7cp8xgdSxI-xpi8Bgzo",
  authDomain: "study-buddy-e8a99.firebaseapp.com",
  projectId: "study-buddy-e8a99",
  storageBucket: "study-buddy-e8a99.firebasestorage.app",
  messagingSenderId: "973004941276",
  appId: "1:973004941276:web:23b69f767aef5ef8c71119"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 