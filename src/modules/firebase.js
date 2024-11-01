import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// Firebase konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyBLoQD9C4uqdY2r6cEVowWpLdfDo0MzkI8",
    authDomain: "bookease-832db.firebaseapp.com",
    databaseURL: "https://bookease-832db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bookease-832db",
    storageBucket: "bookease-832db.appspot.com",
    messagingSenderId: "772725519548",
    appId: "1:772725519548:web:f87b8f6d5dfbc742ea0cb9"
  };
  
  

// Initialisering af Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Eksport af databasen
export { db, auth };