import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import ChartCard from './ChartCard';

const AdminPanel = () => {
  const [adminCount, setAdminCount] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentChartData, setDepartmentChartData] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get admin count
        const adminSnap = await getDocs(collection(db, 'register'));
        setAdminCount(adminSnap.size);
        // Get employee count
        const empSnap = await getDocs(collection(db, 'employees'));
        setEmployeeCount(empSnap.size);
        // Prepare chart data
        const empData = empSnap.docs.map(doc => doc.data());
        const deptMap = {};
        empData.forEach(emp => {
          const dept = emp.department || 'Other';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        const chartData = Object.keys(deptMap).map(dept => ({
          label: dept,
          value: deptMap[dept],
        }));
        setDepartmentChartData(chartData);
      } catch (error) {
        setAdminCount('Error');
        setEmployeeCount('Error');
        setDepartmentChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Registered Admin</Text>
          {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{adminCount}</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Employees</Text>
          {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{employeeCount}</Text>}
        </View>
      </View>
      {/* Admin Profile List */}
      <Text style={styles.sectionTitle}>Admin Profiles</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <AdminList />
      )}
      {/* Employee Data List */}
      <Text style={styles.sectionTitle}>Employee Data</Text>
      <EmployeeList />
      {/* Charts Section */}
      <Text style={styles.sectionTitle}>Charts</Text>
      <ChartCard
        title="Employees per Department"
        data={departmentChartData}
      />
      {/* पुढील features इथे add करूया */}
    </ScrollView>
  );
};

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Modal, TextInput, Button } from 'react-native';

// Admin List Component
const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, 'register'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(data);
    } catch (e) {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'register', id));
      setAdmins(admins.filter(a => a.id !== id));
      alert('Admin deleted successfully');
    } catch (e) {
      alert('Failed to delete admin');
    }
  };

  const handleEdit = (admin) => {
    setEditData({ ...admin });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const { id, username, email, password } = editData;
      await updateDoc(doc(db, 'register', id), { username, email, password });
      setEditModalVisible(false);
      fetchAdmins();
      alert('Admin updated successfully');
    } catch (e) {
      alert('Failed to update admin');
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!admins.length) return <Text>No admins found.</Text>;

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Username</Text>
        <Text style={styles.tableHeaderCell}>Email</Text>
        <Text style={styles.tableHeaderCell}>Password</Text>
        <Text style={styles.tableHeaderCell}>Edit</Text>
        <Text style={styles.tableHeaderCell}>Delete</Text>
      </View>
      {admins.map(admin => (
        <View key={admin.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{admin.username}</Text>
          <Text style={styles.tableCell}>{admin.email}</Text>
          <Text style={styles.tableCell}>{admin.password}</Text>
          <Text style={[styles.editButton, styles.tableCell]} onPress={() => handleEdit(admin)}>Edit</Text>
          <Text style={[styles.deleteButton, styles.tableCell]} onPress={() => handleDelete(admin.id)}>Delete</Text>
        </View>
      ))}
      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor:'#fff', padding:20, borderRadius:10, width:'90%' }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:10 }}>Edit Admin</Text>
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.username}
              onChangeText={txt => setEditData({ ...editData, username: txt })}
              placeholder="Username"
            />
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.email}
              onChangeText={txt => setEditData({ ...editData, email: txt })}
              placeholder="Email"
            />
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.password}
              onChangeText={txt => setEditData({ ...editData, password: txt })}
              placeholder="Password"
              secureTextEntry
            />
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Employee List Component
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
    } catch (e) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      setEmployees(employees.filter(e => e.id !== id));
      alert('Employee deleted successfully');
    } catch (e) {
      alert('Failed to delete employee');
    }
  };

  const handleEdit = (emp) => {
    setEditData({ ...emp });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const { id, empId, name, department, role } = editData;
      await updateDoc(doc(db, 'employees', id), { empId, name, department, role });
      setEditModalVisible(false);
      fetchEmployees();
      alert('Employee updated successfully');
    } catch (e) {
      alert('Failed to update employee');
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!employees.length) return <Text>No employees found.</Text>;

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>ID</Text>
        <Text style={styles.tableHeaderCell}>Name</Text>
        <Text style={styles.tableHeaderCell}>Department</Text>
        <Text style={styles.tableHeaderCell}>Role</Text>
        <Text style={styles.tableHeaderCell}>Edit</Text>
        <Text style={styles.tableHeaderCell}>Delete</Text>
      </View>
      {employees.map(emp => (
        <View key={emp.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{emp.empId || emp.id}</Text>
          <Text style={styles.tableCell}>{emp.name}</Text>
          <Text style={styles.tableCell}>{emp.department}</Text>
          <Text style={styles.tableCell}>{emp.role}</Text>
          <Text style={[styles.editButton, styles.tableCell]} onPress={() => handleEdit(emp)}>Edit</Text>
          <Text style={[styles.deleteButton, styles.tableCell]} onPress={() => handleDelete(emp.id)}>Delete</Text>
        </View>
      ))}
      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor:'#fff', padding:20, borderRadius:10, width:'90%' }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:10 }}>Edit Employee</Text>
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.empId}
              onChangeText={txt => setEditData({ ...editData, empId: txt })}
              placeholder="Employee ID"
            />
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.name}
              onChangeText={txt => setEditData({ ...editData, name: txt })}
              placeholder="Name"
            />
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.department}
              onChangeText={txt => setEditData({ ...editData, department: txt })}
              placeholder="Department"
            />
            <TextInput
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
              value={editData?.role}
              onChangeText={txt => setEditData({ ...editData, role: txt })}
              placeholder="Role"
            />
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  card: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 12, marginHorizontal: 10, alignItems: 'center', width: 170, elevation: 3 },
  cardTitle: { fontSize: 16, color: '#E31937', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#E31937', marginVertical: 18, alignSelf: 'flex-start' },
  table: { width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 24, elevation: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  tableHeaderCell: { flex: 1, fontWeight: 'bold', padding: 10, color: '#333', textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ececec', alignItems: 'center' },
  tableCell: { flex: 1, padding: 10, textAlign: 'center', color: '#444' },
  editButton: { color: '#FF5722', fontWeight: 'bold' }, // orange-red
  deleteButton: { color: '#E31937', fontWeight: 'bold' }, // pure red
});

export default AdminPanel;
