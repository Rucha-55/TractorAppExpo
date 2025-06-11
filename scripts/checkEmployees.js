const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const firebaseConfig = require('../config/firebaseConfig').firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkEmployees() {
  try {
    console.log('Fetching employees collection...');
    const querySnapshot = await getDocs(collection(db, 'employees'));
    
    if (querySnapshot.empty) {
      console.log('No employees found in the database.');
      return;
    }

    console.log('Employees in the database:');
    querySnapshot.forEach((doc) => {
      console.log(`ID: ${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error('Error checking employees:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the check
checkEmployees().then(() => {
  console.log('Check completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
