// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../config/firebase';
// import ChartCard from './ChartCard';

// const AdminPanel = () => {
//   const [adminCount, setAdminCount] = useState(null);
//   const [employeeCount, setEmployeeCount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [departmentChartData, setDepartmentChartData] = useState([]);

//   useEffect(() => {
//     const fetchCounts = async () => {
//       try {
//         // Get admin count
//         const adminSnap = await getDocs(collection(db, 'register'));
//         setAdminCount(adminSnap.size);
//         // Get employee count
//         const empSnap = await getDocs(collection(db, 'employees'));
//         setEmployeeCount(empSnap.size);
//         // Prepare chart data
//         const empData = empSnap.docs.map(doc => doc.data());
//         const deptMap = {};
//         empData.forEach(emp => {
//           const dept = emp.department || 'Other';
//           deptMap[dept] = (deptMap[dept] || 0) + 1;
//         });
//         const chartData = Object.keys(deptMap).map(dept => ({
//           label: dept,
//           value: deptMap[dept],
//         }));
//         setDepartmentChartData(chartData);
//       } catch (error) {
//         setAdminCount('Error');
//         setEmployeeCount('Error');
//         setDepartmentChartData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCounts();
//   }, []);

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Admin Dashboard</Text>
//       <View style={styles.cardRow}>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Registered Admin</Text>
//           {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{adminCount}</Text>}
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Employees</Text>
//           {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{employeeCount}</Text>}
//         </View>
//       </View>
//       {/* Admin Profile List */}
//       <Text style={styles.sectionTitle}>Admin Profiles</Text>
//       {loading ? (
//         <ActivityIndicator />
//       ) : (
//         <AdminList />
//       )}
//       {/* Employee Data List */}
//       <Text style={styles.sectionTitle}>Employee Data</Text>
//       <EmployeeList />
//       {/* Charts Section */}
//       <Text style={styles.sectionTitle}>Charts</Text>
//       <ChartCard
//         title="Employees per Department"
//         data={departmentChartData}
//       />
//       {/* पुढील features इथे add करूया */}
//     </ScrollView>
//   );
// };

// import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { Modal, TextInput, Button } from 'react-native';

// // Admin List Component
// const AdminList = () => {
//   const [admins, setAdmins] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editData, setEditData] = useState(null);

//   const fetchAdmins = async () => {
//     try {
//       const snap = await getDocs(collection(db, 'register'));
//       const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setAdmins(data);
//     } catch (e) {
//       setAdmins([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAdmins();
//   }, []);

//   const handleDelete = async (id) => {
//     try {
//       await deleteDoc(doc(db, 'register', id));
//       setAdmins(admins.filter(a => a.id !== id));
//       alert('Admin deleted successfully');
//     } catch (e) {
//       alert('Failed to delete admin');
//     }
//   };

//   const handleEdit = (admin) => {
//     setEditData({ ...admin });
//     setEditModalVisible(true);
//   };

//   const handleEditSave = async () => {
//     try {
//       const { id, username, email, password } = editData;
//       await updateDoc(doc(db, 'register', id), { username, email, password });
//       setEditModalVisible(false);
//       fetchAdmins();
//       alert('Admin updated successfully');
//     } catch (e) {
//       alert('Failed to update admin');
//     }
//   };

//   if (loading) return <ActivityIndicator />;
//   if (!admins.length) return <Text>No admins found.</Text>;

//   return (
//     <View style={styles.table}>
//       <View style={styles.tableHeader}>
//         <Text style={styles.tableHeaderCell}>Username</Text>
//         <Text style={styles.tableHeaderCell}>Email</Text>
//         <Text style={styles.tableHeaderCell}>Password</Text>
//         <Text style={styles.tableHeaderCell}>Edit</Text>
//         <Text style={styles.tableHeaderCell}>Delete</Text>
//       </View>
//       {admins.map(admin => (
//         <View key={admin.id} style={styles.tableRow}>
//           <Text style={styles.tableCell}>{admin.username}</Text>
//           <Text style={styles.tableCell}>{admin.email}</Text>
//           <Text style={styles.tableCell}>{admin.password}</Text>
//           <Text style={[styles.editButton, styles.tableCell]} onPress={() => handleEdit(admin)}>Edit</Text>
//           <Text style={[styles.deleteButton, styles.tableCell]} onPress={() => handleDelete(admin.id)}>Delete</Text>
//         </View>
//       ))}
//       {/* Edit Modal */}
//       <Modal
//         visible={editModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
//           <View style={{ backgroundColor:'#fff', padding:20, borderRadius:10, width:'90%' }}>
//             <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:10 }}>Edit Admin</Text>
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.username}
//               onChangeText={txt => setEditData({ ...editData, username: txt })}
//               placeholder="Username"
//             />
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.email}
//               onChangeText={txt => setEditData({ ...editData, email: txt })}
//               placeholder="Email"
//             />
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.password}
//               onChangeText={txt => setEditData({ ...editData, password: txt })}
//               placeholder="Password"
//               secureTextEntry
//             />
//             <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
//               <Button title="Save" onPress={handleEditSave} />
//               <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // Employee List Component
// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editData, setEditData] = useState(null);

//   const fetchEmployees = async () => {
//     try {
//       const snap = await getDocs(collection(db, 'employees'));
//       const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setEmployees(data);
//     } catch (e) {
//       setEmployees([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const handleDelete = async (id) => {
//     try {
//       await deleteDoc(doc(db, 'employees', id));
//       setEmployees(employees.filter(e => e.id !== id));
//       alert('Employee deleted successfully');
//     } catch (e) {
//       alert('Failed to delete employee');
//     }
//   };

//   const handleEdit = (emp) => {
//     setEditData({ ...emp });
//     setEditModalVisible(true);
//   };

//   const handleEditSave = async () => {
//     try {
//       const { id, empId, name, department, role } = editData;
//       await updateDoc(doc(db, 'employees', id), { empId, name, department, role });
//       setEditModalVisible(false);
//       fetchEmployees();
//       alert('Employee updated successfully');
//     } catch (e) {
//       alert('Failed to update employee');
//     }
//   };

//   if (loading) return <ActivityIndicator />;
//   if (!employees.length) return <Text>No employees found.</Text>;

//   return (
//     <View style={styles.table}>
//       <View style={styles.tableHeader}>
//         <Text style={styles.tableHeaderCell}>ID</Text>
//         <Text style={styles.tableHeaderCell}>Name</Text>
//         <Text style={styles.tableHeaderCell}>Department</Text>
//         <Text style={styles.tableHeaderCell}>Role</Text>
//         <Text style={styles.tableHeaderCell}>Edit</Text>
//         <Text style={styles.tableHeaderCell}>Delete</Text>
//       </View>
//       {employees.map(emp => (
//         <View key={emp.id} style={styles.tableRow}>
//           <Text style={styles.tableCell}>{emp.empId || emp.id}</Text>
//           <Text style={styles.tableCell}>{emp.name}</Text>
//           <Text style={styles.tableCell}>{emp.department}</Text>
//           <Text style={styles.tableCell}>{emp.role}</Text>
//           <Text style={[styles.editButton, styles.tableCell]} onPress={() => handleEdit(emp)}>Edit</Text>
//           <Text style={[styles.deleteButton, styles.tableCell]} onPress={() => handleDelete(emp.id)}>Delete</Text>
//         </View>
//       ))}
//       {/* Edit Modal */}
//       <Modal
//         visible={editModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)' }}>
//           <View style={{ backgroundColor:'#fff', padding:20, borderRadius:10, width:'90%' }}>
//             <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:10 }}>Edit Employee</Text>
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.empId}
//               onChangeText={txt => setEditData({ ...editData, empId: txt })}
//               placeholder="Employee ID"
//             />
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.name}
//               onChangeText={txt => setEditData({ ...editData, name: txt })}
//               placeholder="Name"
//             />
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.department}
//               onChangeText={txt => setEditData({ ...editData, department: txt })}
//               placeholder="Department"
//             />
//             <TextInput
//               style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, marginBottom:10, padding:8 }}
//               value={editData?.role}
//               onChangeText={txt => setEditData({ ...editData, role: txt })}
//               placeholder="Role"
//             />
//             <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
//               <Button title="Save" onPress={handleEditSave} />
//               <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center' },
//   heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   cardRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
//   card: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 12, marginHorizontal: 10, alignItems: 'center', width: 170, elevation: 3 },
//   cardTitle: { fontSize: 16, color: '#E31937', marginBottom: 8 },
//   cardValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
//   sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#E31937', marginVertical: 18, alignSelf: 'flex-start' },
//   table: { width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 24, elevation: 2 },
//   tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
//   tableHeaderCell: { flex: 1, fontWeight: 'bold', padding: 10, color: '#333', textAlign: 'center' },
//   tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ececec', alignItems: 'center' },
//   tableCell: { flex: 1, padding: 10, textAlign: 'center', color: '#444' },
//   editButton: { color: '#FF5722', fontWeight: 'bold' }, // orange-red
//   deleteButton: { color: '#E31937', fontWeight: 'bold' }, // pure red
// });

// export default AdminPanel;



import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../config/firebase';
import ChartCard from './ChartCard';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminCount, setAdminCount] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentChartData, setDepartmentChartData] = useState([]);
  const [maxMood, setMaxMood] = useState('SAD');
  const [hits, setHits] = useState(1);
  const [moodData, setMoodData] = useState([]);
  const [moodPercentage, setMoodPercentage] = useState(100);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get admin count
        const adminSnap = await getDocs(collection(db, 'register'));
        setAdminCount(adminSnap.size);
        
        // Get employee count
        const empSnap = await getDocs(collection(db, 'employees'));
        setEmployeeCount(empSnap.size);
        
        // Prepare department chart data
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
        
        // Get mood data from chat responses
        const moodSnap = await getDocs(collection(db, 'chatResponses'));
        const moodCounts = {};
        let totalMoods = 0;
        
        moodSnap.docs.forEach(doc => {
          const mood = doc.data().mood || 'UNKNOWN';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          totalMoods++;
        });
        
        // Determine max mood
        let maxCount = 0;
        let dominantMood = 'SAD';
        Object.keys(moodCounts).forEach(mood => {
          if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            dominantMood = mood;
          }
        });
        
        setMaxMood(dominantMood);
        setMoodPercentage(Math.round((maxCount / totalMoods) * 100));
        
        // Prepare mood data for pie chart
        const moodChartData = Object.keys(moodCounts).map(mood => ({
          name: mood,
          count: moodCounts[mood],
          color: getMoodColor(mood),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));
        
        setMoodData(moodChartData);
        setHits(totalMoods);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAdminCount('Error');
        setEmployeeCount('Error');
        setDepartmentChartData([]);
        setMoodData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  const getMoodColor = (mood) => {
    switch(mood.toUpperCase()) {
      case 'GLAD': return '#2ecc71';
      case 'MAD': return '#3498db';
      case 'SAD': return '#e74c3c';
      case 'NEUTRAL': return '#f39c12';
      case 'EXCITED': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Dashboard</Text>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>TOTAL REGISTERED ADMIN</Text>
                {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{adminCount}</Text>}
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>TOTAL EMPLOYEES</Text>
                {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{employeeCount}</Text>}
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>TOTAL HITS</Text>
                <Text style={styles.cardValue}>{hits}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>MAX EMPLOYEE MOOD</Text>
                <Text style={styles.cardValue}>{maxMood}</Text>
              </View>
            </View>
            
         
            
            {/* Mood Pie Chart */}
            {moodData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Mood Distribution</Text>
                <PieChart
                  data={moodData}
                  width={350}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend
                />
              </View>
            )}
            
            {/* Department Chart */}
            <Text style={styles.sectionTitle}>Employees per Department</Text>
            <ChartCard
              title="Employees per Department"
              data={departmentChartData}
            />
          </View>
        );
      // ... rest of your cases remain the same
      case 'adminProfile':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Admin Profiles</Text>
            <AdminList />
          </View>
        );
      case 'employeeData':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Employee Data</Text>
            <EmployeeList />
          </View>
        );
      case 'charts':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Charts</Text>
            <ChartCard
              title="Employees per Department"
              data={departmentChartData}
            />
          </View>
        );
      case 'tables':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Tables</Text>
            <Text>Tables content will go here</Text>
          </View>
        );
      default:
        return (
          <View style={styles.content}>
            <Text>Select a menu item</Text>
          </View>
        );
    }
  };

  // ... rest of your component remains the same
   return (
      <SafeAreaView style={styles.container}>
        <View style={styles.sidebar}>
          <Text style={styles.sidebarHeader}>MDOIO ADMIN</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'dashboard' && styles.activeMenuItem]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>
          
          <Text style={styles.menuCategory}>INTEGRACE</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'adminProfile' && styles.activeMenuItem]}
            onPress={() => setActiveTab('adminProfile')}
          >
            <Text style={styles.menuText}>Admin Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'employeeData' && styles.activeMenuItem]}
            onPress={() => setActiveTab('employeeData')}
          >
            <Text style={styles.menuText}>Employee Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'charts' && styles.activeMenuItem]}
            onPress={() => setActiveTab('charts')}
          >
            <Text style={styles.menuText}>Charts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'tables' && styles.activeMenuItem]}
            onPress={() => setActiveTab('tables')}
          >
            <Text style={styles.menuText}>Tables</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.mainContent}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    );
};

// ... rest of your code (AdminList, EmployeeList, styles) remains the same
const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: ''
  });

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

  const handleAddAdmin = async () => {
    try {
      await addDoc(collection(db, 'register'), newAdmin);
      setAddModalVisible(false);
      setNewAdmin({ username: '', email: '', password: '' });
      fetchAdmins();
      alert('Admin added successfully');
    } catch (e) {
      alert('Failed to add admin');
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.adminProfileContainer}>
      {/* Add Admin Button */}
      <View style={styles.adminHeader}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Admin Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Profile Heading */}
      <Text style={styles.sectionTitle}>Admin Profile</Text>

      {/* Admin Table */}
      <View style={styles.adminTable}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, {flex: 1.2}]}>Username</Text>
          <Text style={[styles.tableHeaderCell, {flex: 1.5}]}>Email</Text>
          <Text style={[styles.tableHeaderCell, {flex: 1.2}]}>Password</Text>
          <Text style={[styles.tableHeaderCell, {flex: 0.8}]}>EDIT</Text>
          <Text style={[styles.tableHeaderCell, {flex: 0.8}]}>DELETE</Text>
        </View>

        {/* Table Rows */}
        {admins.length === 0 ? (
          <View style={styles.noDataRow}>
            <Text style={styles.noDataText}>No admins found</Text>
          </View>
        ) : (
          <FlatList
            data={admins}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 1.2}]}>{item.username}</Text>
                <Text style={[styles.tableCell, {flex: 1.5}]}>{item.email}</Text>
                <Text style={[styles.tableCell, {flex: 1.2}]}>{item.password}</Text>
                <View style={[styles.tableCell, {flex: 0.8}]}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.actionButtonText}>EDIT</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, {flex: 0.8}]}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.actionButtonText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Edit Admin Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Admin</Text>
            <TextInput
              style={styles.input}
              value={editData?.username}
              onChangeText={txt => setEditData({ ...editData, username: txt })}
              placeholder="Username"
            />
            <TextInput
              style={styles.input}
              value={editData?.email}
              onChangeText={txt => setEditData({ ...editData, email: txt })}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={editData?.password}
              onChangeText={txt => setEditData({ ...editData, password: txt })}
              placeholder="Password"
              secureTextEntry
            />
            <View style={styles.buttonRow}>
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Admin</Text>
            <TextInput
              style={styles.input}
              value={newAdmin.username}
              onChangeText={txt => setNewAdmin({ ...newAdmin, username: txt })}
              placeholder="Username"
            />
            <TextInput
              style={styles.input}
              value={newAdmin.email}
              onChangeText={txt => setNewAdmin({ ...newAdmin, email: txt })}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={newAdmin.password}
              onChangeText={txt => setNewAdmin({ ...newAdmin, password: txt })}
              placeholder="Password"
              secureTextEntry
            />
            <View style={styles.buttonRow}>
              <Button title="Add" onPress={handleAddAdmin} />
              <Button title="Cancel" color="#E31937" onPress={() => setAddModalVisible(false)} />
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
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    empId: '',
    name: '',
    department: '',
    role: ''
  });

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

  const handleAddEmployee = async () => {
    try {
      await addDoc(collection(db, 'employees'), newEmployee);
      setAddModalVisible(false);
      setNewEmployee({ empId: '', name: '', department: '', role: '' });
      fetchEmployees();
      alert('Employee added successfully');
    } catch (e) {
      alert('Failed to add employee');
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.adminProfileContainer}>
      {/* Add Employee Button */}
      <View style={styles.adminHeader}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Employee</Text>
        </TouchableOpacity>
      </View>

      {/* Employee Data Heading */}
      <Text style={styles.sectionTitle}>Employee Data</Text>

      {/* Employee Table */}
      <View style={styles.adminTable}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, {flex: 0.8}]}>ID</Text>
          <Text style={[styles.tableHeaderCell, {flex: 1.5}]}>Name</Text>
          <Text style={[styles.tableHeaderCell, {flex: 1.2}]}>Department</Text>
          <Text style={[styles.tableHeaderCell, {flex: 1.2}]}>Role</Text>
          <Text style={[styles.tableHeaderCell, {flex: 0.8}]}>EDIT</Text>
          <Text style={[styles.tableHeaderCell, {flex: 0.8}]}>DELETE</Text>
        </View>

        {/* Table Rows */}
        {employees.length === 0 ? (
          <View style={styles.noDataRow}>
            <Text style={styles.noDataText}>No employees found</Text>
          </View>
        ) : (
          <FlatList
            data={employees}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 0.8}]}>{item.empId || item.id}</Text>
                <Text style={[styles.tableCell, {flex: 1.5}]}>{item.name}</Text>
                <Text style={[styles.tableCell, {flex: 1.2}]}>{item.department}</Text>
                <Text style={[styles.tableCell, {flex: 1.2}]}>{item.role}</Text>
                <View style={[styles.tableCell, {flex: 0.8}]}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.actionButtonText}>EDIT</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.tableCell, {flex: 0.8}]}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.actionButtonText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Edit Employee Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Employee</Text>
            <TextInput
              style={styles.input}
              value={editData?.empId}
              onChangeText={txt => setEditData({ ...editData, empId: txt })}
              placeholder="Employee ID"
            />
            <TextInput
              style={styles.input}
              value={editData?.name}
              onChangeText={txt => setEditData({ ...editData, name: txt })}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={editData?.department}
              onChangeText={txt => setEditData({ ...editData, department: txt })}
              placeholder="Department"
            />
            <TextInput
              style={styles.input}
              value={editData?.role}
              onChangeText={txt => setEditData({ ...editData, role: txt })}
              placeholder="Role"
            />
            <View style={styles.buttonRow}>
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Employee</Text>
            <TextInput
              style={styles.input}
              value={newEmployee.empId}
              onChangeText={txt => setNewEmployee({ ...newEmployee, empId: txt })}
              placeholder="Employee ID"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.name}
              onChangeText={txt => setNewEmployee({ ...newEmployee, name: txt })}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.department}
              onChangeText={txt => setNewEmployee({ ...newEmployee, department: txt })}
              placeholder="Department"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.role}
              onChangeText={txt => setNewEmployee({ ...newEmployee, role: txt })}
              placeholder="Role"
            />
            <View style={styles.buttonRow}>
              <Button title="Add" onPress={handleAddEmployee} />
              <Button title="Cancel" color="#E31937" onPress={() => setAddModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2c3e50',
    paddingTop: 20,
  },
  sidebarHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  menuCategory: {
    color: '#7f8c8d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },
  menuItem: {
    padding: 15,
    paddingLeft: 20,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  activeMenuItem: {
    backgroundColor: '#34495e',
    borderLeftColor: '#E31937',
  },
  menuText: {
    color: '#ecf0f1',
    fontSize: 16,
  },
  mainContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  moodSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  moodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 18,
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  moodPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31937',
    marginBottom: 15,
  },
  /* Table Styles (from original code) */
  table: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginBottom: 24, 
    elevation: 2 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f0f0f0', 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10 
  },
  tableHeaderCell: { 
    flex: 1, 
    fontWeight: 'bold', 
    padding: 10, 
    color: '#333', 
    textAlign: 'center' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderColor: '#ececec', 
    alignItems: 'center' 
  },
  tableCell: { 
    flex: 1, 
    padding: 10, 
    textAlign: 'center', 
    color: '#444' 
  },
  editButton: { 
    color: '#FF5722', 
    fontWeight: 'bold' 
  },
  deleteButton: { 
    color: '#E31937', 
    fontWeight: 'bold' 
  },
  /* Modal Styles (from original code) */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%'
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
    padding: 8
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
    
    adminProfileContainer: {
      flex: 1,
      padding: 10,
    },
    adminHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      backgroundColor: '#fff',
    },
    addButton: {
      backgroundColor: '#E31937',
      padding: 10,
      borderRadius: 5,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    adminTable: {
      backgroundColor: '#fff',
      borderRadius: 5,
      overflow: 'hidden',
      elevation: 2,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      paddingVertical: 12,
    },
    tableHeaderCell: {
      flex: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: '#eee',
      paddingVertical: 12,
      alignItems: 'center',
    },
    tableCell: {
      flex: 1,
      textAlign: 'center',
      color: '#444',
    },
    actionButton: {
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 4,
      marginHorizontal: 2,
    },
    editButton: {
      backgroundColor: '#FFA000',
      width:55,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      backgroundColor: '#E31937',
      width:75,
    },
    actionButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
    },
    noDataRow: {
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataText: {
      color: '#888',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      width: '90%',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#2c3e50',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
     tableHeaderCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableCell: {
    textAlign: 'center',
    color: '#444',
    paddingVertical: 12,
    paddingHorizontal: 4,
  }
});

export default AdminPanel;