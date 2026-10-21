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

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- إعدادات Supabase ---
// انسخ الرابط والمفتاح من لوحة تحكم Supabase (Project Settings > API)
export const SUPABASE_URL = 'https://fqhlnrwqceqznnwalod.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_dq-R4PAgPblSf0e88K2YmQ_9EW4i2e1';
