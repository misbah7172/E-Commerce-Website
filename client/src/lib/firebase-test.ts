import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// For development, you can optionally use the auth emulator
// Uncomment the next line if you want to use Firebase Auth Emulator
// connectAuthEmulator(auth, "http://127.0.0.1:9099");

export default app;

// Test Firebase connection
console.log("Firebase initialized with project:", firebaseConfig.projectId);
console.log("Auth domain:", firebaseConfig.authDomain);
