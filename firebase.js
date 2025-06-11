// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
