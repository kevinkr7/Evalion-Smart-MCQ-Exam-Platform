import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: "technical-quiz-1c612.firebaseapp.com",
  projectId: "technical-quiz-1c612",
  storageBucket: "technical-quiz-1c612.firebasestorage.app",
  messagingSenderId: "588274667614",
  appId: "1:588274667614:web:7ef7100fc38fdb48f764cf",
  measurementId: "G-3VX2D8J2CL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);