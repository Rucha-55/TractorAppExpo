import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../config/firebase';

/**
 * Parse employees from an Excel file and store in Firestore using their id as document ID.
 * @param {File|Object} file - The Excel file (web File or mobile file object with uri)
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function importEmployeesFromExcel(file) {
  try {
    let data;
    if (file.arrayBuffer) {
      data = await file.arrayBuffer();
    } else if (file.uri) {
      const response = await fetch(file.uri);
      data = await response.arrayBuffer();
    } else {
      throw new Error('Unsupported file type');
    }
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    // Normalize and collect employees
    const employees = json.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.trim().toLowerCase()] = row[key];
      });
      // Convert all fields to lowercase if they are strings
      return {
        empId: normalizedRow['id'] ? String(normalizedRow['id']).toLowerCase() : (normalizedRow['empid'] ? String(normalizedRow['empid']).toLowerCase() : ''),
        name: normalizedRow['name'] ? String(normalizedRow['name']).toLowerCase() : '',
        role: normalizedRow['grade'] ? String(normalizedRow['grade']).toLowerCase() : '',
        state: normalizedRow['state'] ? String(normalizedRow['state']).toLowerCase() : '',
        department: normalizedRow['department'] ? String(normalizedRow['department']).toLowerCase() : '',
        mobile: normalizedRow['official mobile no.'] ? String(normalizedRow['official mobile no.']).toLowerCase() : '',
        email: normalizedRow['email'] ? String(normalizedRow['email']).toLowerCase() : ''
      };
    });

    let success = 0, failed = 0;
    for (const emp of employees) {
      if (!emp.empId) { failed++; continue; }
      try {
        await setDoc(doc(db, 'employees', String(emp.empId)), emp);
        success++;
      } catch (e) {
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    throw new Error('Failed to import employees: ' + error.message);
  }
}

async function deleteAllEmployees() {
  try {
    const querySnapshot = await getDocs(collection(db, 'chatResponses'));
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'chatResponses', docSnap.id)));
    });
    await Promise.all(deletePromises);
    return deletePromises.length;
  } catch (error) {
    throw new Error('Failed to delete employees: ' + error.message);
  }
}

function ImportEmployeesSection() {
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await importEmployeesFromExcel(file);
      alert(`Imported: ${result.success}, Failed: ${result.failed}`);
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL employee data? This cannot be undone.')) return;
    try {
      const deletedCount = await deleteAllEmployees();
      alert(`Deleted ${deletedCount} employee records.`);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: 24 }}>Import Employees from Excel</h1>
      <div style={{ margin: '20px 0' }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          style={{
            background: '#2c3e50',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: 12
          }}
          onClick={() => fileInputRef.current.click()}
        >
          Upload Excel File to Import Employees
        </button>
        <button
          style={{
            background: '#e74c3c',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: 12
          }}
          onClick={handleDeleteAll}
        >
          Delete All Employees
        </button>
      </div>
    </div>
  );
}

export default ImportEmployeesSection; 