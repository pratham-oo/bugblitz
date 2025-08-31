// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3whYVEQohZkY-oHgYUsyDws5rVFki_No",
  authDomain: "bugblitz-ai.firebaseapp.com",
  projectId: "bugblitz-ai",
  storageBucket: "bugblitz-ai.firebasestorage.app",
  messagingSenderId: "1088788921738",
  appId: "1:1088788921738:web:a7bb3fbec097eff44d9c73"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);  // ✅ Only exported once


// ✅ EXPORT THEM PROPERLY
export default app;
