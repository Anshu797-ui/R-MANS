
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// R-MANS Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdM4z2PXFnwRPYknt1Fz1MAapu8yN_O7c",
  authDomain: "r-mans-16766.firebaseapp.com",
  projectId: "r-mans-16766",
  storageBucket: "r-mans-16766.firebasestorage.app",
  messagingSenderId: "732516548944",
  appId: "1:732516548944:web:e590e58607f2ca093d2c55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase Services
export { app, auth, db, storage };
