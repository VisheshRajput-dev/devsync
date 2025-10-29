import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         firebaseConfig.apiKey !== 'your_api_key_here';
};

// Initialize Firebase only if configured
let app: any = null;
let db: any = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('🔥 Firebase initialization failed:', error);
  }
} else {
  console.warn('🔥 Firebase not configured. Please set up environment variables.');
}

export { db, isFirebaseConfigured };
export default app;
