// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzAXsI39sMc2St_Uuhs4Z4ld3f__KOfb4",
  authDomain: "mahindraproject-b0a6f.firebaseapp.com",
  projectId: "mahindraproject-b0a6f",
  storageBucket: "mahindraproject-b0a6f.appspot.com",
  messagingSenderId: "824885367826",
  appId: "1:824885367826:web:6387dd58e498d73bee74cb",
  measurementId: "G-0EJRJ05XY3"
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error; // Re-throw to handle in the calling code
}

// Enable offline persistence
const enableFirestorePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    } else {
      console.error('Error enabling persistence:', err);
    }
  }
};

// Enable persistence when the app starts
enableFirestorePersistence();

export { db };
