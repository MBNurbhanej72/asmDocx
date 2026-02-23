import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  //? For file storage
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_URL,
};



export const app = initializeApp(firebaseConfig);


//? Create authentication instance
export const auth = getAuth(app);


//? Create firestore instance
export const db = getFirestore(app);

//? Create storage instance
export const storage = getStorage(app);