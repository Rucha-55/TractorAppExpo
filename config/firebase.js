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

// Function to register admin in Firestore
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

/**
 * Registers a new admin in the Firestore 'register' collection.
 * @param {string} username - The admin's username
 * @param {string} email - The admin's email
 * @param {string} password - The admin's password (consider hashing in production)
 * @returns {Promise<string>} The new document ID
 */
export async function registerAdmin(username, email, password) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const docRef = await addDoc(collection(db, 'register'), {
      username,
      email,
      password, // In production, hash the password!
      role: 'admin',
      createdAt: new Date()
    });
    console.log('Admin registered with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error registering admin:', e);
    throw e;
  }
}

// Admin login function
/**
 * Checks if the provided email and password match an admin in Firestore 'register' collection.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, admin?: any, message?: string}>}
 */
export async function adminLogin(email, password) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const q = query(
      collection(db, 'register'),
      where('email', '==', email),
      where('password', '==', password)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Login success!
      return { success: true, admin: querySnapshot.docs[0].data() };
    } else {
      // No matching admin found
      return { success: false, message: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Automatically add a default admin if not present
(async () => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, 'register'));
      if (snapshot.empty) {
        await addDoc(collection(db, 'register'), {
          username: 'admin',
          email: 'admin@admin.com',
          password: 'admin123', // In production, hash this!
          role: 'admin',
          createdAt: new Date()
        });
        console.log('Default admin created in Firestore.');
      } else {
        console.log('Admin(s) already exist in Firestore.');
      }
    } catch (e) {
      console.error('Error auto-adding admin:', e);
    }
  }
})();

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
