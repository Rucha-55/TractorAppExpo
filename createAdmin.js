// createAdmin.js - Script to create a default admin in Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzAXsI39sMc2St_Uuhs4Z4ld3f__KOfb4",
  authDomain: "mahindraproject-b0a6f.firebaseapp.com",
  projectId: "mahindraproject-b0a6f",
  storageBucket: "mahindraproject-b0a6f.appspot.com",
  messagingSenderId: "824885367826",
  appId: "1:824885367826:web:6387dd58e498d73bee74cb",
  measurementId: "G-0EJRJ05XY3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
  try {
    await addDoc(collection(db, 'register'), {
      username: 'admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date()
    });
    console.log('Admin created!');
  } catch (e) {
    console.error('Error:', e);
  }
}

createAdmin();
