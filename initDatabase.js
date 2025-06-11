const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeEmployees() {
  const employees = Array.from({ length: 10 }, (_, i) => ({
    employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
    name: `Employee ${i + 1}`,
    department: 'Tractor Department',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    active: true
  }));

  const batch = db.batch();
  const employeesRef = db.collection('employees');

  // Add all employees to batch
  employees.forEach(emp => {
    const docRef = employeesRef.doc(emp.employeeId);
    batch.set(docRef, emp);
  });

  try {
    // Commit the batch
    await batch.commit();
    console.log('✅ Successfully initialized employee database!');
    employees.forEach(emp => console.log(`Added employee: ${emp.employeeId}`));
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    // Close the connection
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the initialization
initializeEmployees();
