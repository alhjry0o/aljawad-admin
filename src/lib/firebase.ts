import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqvU39UNBBqJDnIee3is3vuDJ9EDlpGQg",
  authDomain: "aljawad-app.firebaseapp.com",
  projectId: "aljawad-app",
  storageBucket: "aljawad-app.firebasestorage.app",
  messagingSenderId: "1062743895350",
  appId: "1:1062743895350:web:b8ae350fc42594f68a9797",
  measurementId: "G-6Q23BYPGYP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
