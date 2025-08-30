import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';

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
const createStyles = (windowWidth) => StyleSheet.create({
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
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
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
  mainContentContainer: {
    flex: 1,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  menuButton: {
    marginRight: 15,
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  card: (windowWidth) => ({
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    width: windowWidth > 768 ? '48%' : '100%',
    marginBottom: windowWidth <= 768 ? 15 : 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }),
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
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: windowWidth < 500 ? 8 : 15,
    marginBottom: windowWidth < 500 ? 10 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31937',
    marginBottom: 15,
  },
  adminProfileContainer: {
    flex: 1,
    padding: 10,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
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
  horizontalScrollContainer: {
    flex: 1,
  },
  adminTable: {
    minWidth: 800, // Set a minimum width that fits all columns
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
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    textAlign: 'center',
    color: '#444',
    paddingHorizontal: 8,
  },
  // Specific cell widths
  usernameCell: {
    width: 150,
  },
  emailCell: {
    width: 200,
  },
  passwordCell: {
    width: 150,
  },
  idCell: {
    width: 100,
  },
  nameCell: {
    width: 200,
  },
  deptCell: {
    width: 150,
  },
  roleCell: {
    width: 150,
  },
  actionCell: {
    width: 100,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  editButton: {
    backgroundColor: '#FFA000',
  },
  deleteButton: {
    backgroundColor: '#E31937',
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
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
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
  departmentPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff'
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  detailButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  employeeMoodTable: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 2
  },
  moodTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12
  },
  moodTableCell: {
    padding: 10,
    textAlign: 'center',
    color: '#444'
  },
  moodHeaderCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    padding: 10
  },
  moodRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10
  },
  // Cell widths for mood table
  moodNameCell: {
    width: 150
  },
  moodDepartmentCell: {
    width: 150
  },
  moodMoodCell: {
    width: 100
  },
  moodElaborationCell: {
    width: 200
  },
  moodDateCell: {
    width: 150
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

const styles = createStyles(Dimensions.get('window').width);

const AdminPanel = () => {
  const router = useRouter();
  // ... (keep all your existing state and functions until renderContent)
   const [activeTab, setActiveTab] = useState('dashboard');
  const [adminCount, setAdminCount] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentChartData, setDepartmentChartData] = useState([]);
  const [maxMood, setMaxMood] = useState('SAD');
  const [hits, setHits] = useState(1);
  const [moodData, setMoodData] = useState([]);
  const [moodPercentage, setMoodPercentage] = useState(100);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const [qaModalVisible, setQaModalVisible] = useState(false);
  const [qaModalData, setQaModalData] = useState(null);

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
          name: dept,
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

    // Handle window dimension changes
    const updateDimensions = ({ window }) => {
      setWindowDimensions(window);
      // Auto-hide sidebar when screen gets larger
      if (window.width > 768) {
        setSidebarVisible(false);
      }
    };

    const dimensionListener = Dimensions.addEventListener('change', updateDimensions);
    return () => dimensionListener.remove();
  }, []);

  const getMoodColor = (mood) => {
    if (!mood) return '#9E9E9E'; // Default grey for undefined moods
    
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('happy') || moodLower.includes('glad')) {
      return '#4CAF50'; // Green
    } else if (moodLower.includes('sad')) {
      return '#2196F3'; // Blue
    } else if (moodLower.includes('angry') || moodLower.includes('mad')) {
      return '#F44336'; // Red
    } else if (moodLower.includes('neutral') || moodLower === 'ok') {
      return '#FFC107'; // Yellow/Amber
    } else {
      return '#9E9E9E'; // Grey for unknown moods
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Auto-close sidebar on mobile after selecting a tab
    if (windowDimensions.width <= 768) {
      setSidebarVisible(false);
    }
  };

  const handleLogout = () => {
    router.replace('/login');
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <View style={styles.content}>
            <Text style={styles.heading}>Dashboard</Text>
            <View style={styles.cardRow}>
              <View style={styles.card(windowDimensions.width)}>
                <Text style={styles.cardTitle}>TOTAL REGISTERED ADMIN</Text>
                {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{adminCount}</Text>}
              </View>
              <View style={styles.card(windowDimensions.width)}>
                <Text style={styles.cardTitle}>TOTAL EMPLOYEES</Text>
                {loading ? <ActivityIndicator /> : <Text style={styles.cardValue}>{employeeCount}</Text>}
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.card(windowDimensions.width)}>
                <Text style={styles.cardTitle}>TOTAL HITS</Text>
                <Text style={styles.cardValue}>{hits}</Text>
              </View>
              <View style={styles.card(windowDimensions.width)}>
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
                  width={Math.min(windowDimensions.width - 40, 350)}
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
              width={windowDimensions.width - 40}
            />
          </View>
        );
      case 'adminProfile':
        return <AdminList />;
      case 'employeeData':
        return <EmployeeList />;
      case 'charts':
        return <DepartmentCharts windowDimensions={windowDimensions} />;
      default:
        return (
          <View style={styles.content}>
            <Text>Select a menu item</Text>
          </View>
        );
    }
  };

  // ... (keep the rest of your AdminPanel component)
  return (
      <SafeAreaView style={styles.container}>
        {/* Sidebar - only visible on large screens or when toggled on mobile */}
        {(windowDimensions.width > 768 || sidebarVisible) && (
          <View style={[styles.sidebar, windowDimensions.width <= 768 && styles.mobileSidebar]}>
            <Text style={styles.sidebarHeader}>MDOIO ADMIN</Text>
            
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'dashboard' && styles.activeMenuItem]}
              onPress={() => handleTabChange('dashboard')}
            >
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>
            
            <Text style={styles.menuCategory}>INTEGRACE</Text>
            
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'adminProfile' && styles.activeMenuItem]}
              onPress={() => handleTabChange('adminProfile')}
            >
              <Text style={styles.menuText}>Admin Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'employeeData' && styles.activeMenuItem]}
              onPress={() => handleTabChange('employeeData')}
            >
              <Text style={styles.menuText}>Employee Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'charts' && styles.activeMenuItem]}
              onPress={() => handleTabChange('charts')}
            >
              <Text style={styles.menuText}>Charts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Main Content Area */}
        <View style={styles.mainContentContainer}>
          {/* Mobile Header with Hamburger Menu */}
          {windowDimensions.width <= 768 && (
            <View style={styles.mobileHeader}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <MaterialIcons name="menu" size={28} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.mobileHeaderTitle}>
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'adminProfile' && 'Admin Profiles'}
                {activeTab === 'employeeData' && 'Employee Data'}
                {activeTab === 'charts' && 'Charts'}
              </Text>
            </View>
          )}
          
          <ScrollView 
            contentContainerStyle={[
              styles.mainContent,
              { paddingBottom: windowDimensions.width <= 768 ? 20 : 40 }
            ]}
          >
            {renderContent()}
          </ScrollView>
        </View>

        {/* Q&A Modal */}
        <Modal
          visible={qaModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setQaModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Employee Q&amp;A</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {qaModalData && Object.entries(qaModalData).map(([question, answer], idx) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold', color: '#E31937' }}>{question}</Text>
                    <Text style={{ marginLeft: 8 }}>{answer}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: '#E31937', marginTop: 10 }]}
                  onPress={() => setQaModalVisible(false)}
                >
                  <Text style={styles.addButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
};

const DepartmentCharts = ({ windowDimensions }) => {
  const isMobile = windowDimensions && windowDimensions.width < 600;
  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [departmentMoodData, setDepartmentMoodData] = useState([]);
  const [stateMoodData, setStateMoodData] = useState([]);
  const [roleMoodData, setRoleMoodData] = useState([]);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(true);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [employeeMoodDetails, setEmployeeMoodDetails] = useState([]);
  const [filteredEmployeeMoodDetails, setFilteredEmployeeMoodDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all employees to extract unique departments, states, and roles
        const empSnap = await getDocs(collection(db, 'employees'));
        const empData = empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched employees:', empData);
        
        // Extract unique departments
        const depts = new Set();
        // Extract unique states
        const stateSet = new Set();
        // Extract unique roles
        const roleSet = new Set();
        
        empData.forEach(emp => {
          if (emp.department) depts.add(emp.department);
          if (emp.state) stateSet.add(emp.state);
          if (emp.role) roleSet.add(emp.role);
        });
        
        setDepartments(Array.from(depts));
        setStates(Array.from(stateSet));
        setRoles(Array.from(roleSet));
        
        if (depts.size > 0) {
          setSelectedDepartment(Array.from(depts)[0]);
        }
        if (stateSet.size > 0) {
          setSelectedState(Array.from(stateSet)[0]);
        }
        if (roleSet.size > 0) {
          setSelectedRole(Array.from(roleSet)[0]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to the feedback data
  const getSortedFeedback = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Apply filters to feedback
  const applyFilters = (data) => {
    return data.filter(item => {
      // Search query filter
      const matchesSearch = !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.empId && item.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.elaboration && item.elaboration.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Mood filter
      const matchesMood = selectedMood === 'All' || 
        (item.mood && item.mood.toLowerCase().includes(selectedMood.toLowerCase()));
      
      // Date range filter
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && item.timestamp && item.timestamp >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // inclusive
        matchesDate = matchesDate && item.timestamp && item.timestamp < end;
      }
      
      return matchesSearch && matchesMood && matchesDate;
    });
  };

  // Export feedback to CSV
  const exportToCSV = async () => {
    try {
      if (filteredEmployeeMoodDetails.length === 0) {
        Alert.alert('No Data', 'There is no data to export.');
        return;
      }

      // Create CSV header
      let csvContent = 'Employee Name,Employee ID,Department,Mood,Comments,Date,Time\n';

      // Add data rows
      filteredEmployeeMoodDetails.forEach(item => {
        const row = [
          `"${(item.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${(item.empId || 'N/A').replace(/"/g, '""')}"`,
          `"${(item.department || 'N/A').replace(/"/g, '""')}"`,
          `"${(item.mood || 'N/A').replace(/"/g, '""')}"`,
          `"${(item.elaboration || 'No comments').replace(/"/g, '""')}"`,
          `"${(item.date || '--/--/----').replace(/"/g, '""')}"`,
          `"${(item.time || '--:--').replace(/"/g, '""')}"`
        ].join(',');
        csvContent += row + '\n';
      });

      // Generate filename with current date and time
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `employee_feedback_${dateString}_${timeString}.csv`;

      // Get the document directory
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Feedback Data',
        UTI: 'public.comma-separated-values-text'
      });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  useEffect(() => {
    if (departments.length > 0 && selectedDepartment === '') {
      setSelectedDepartment('All');
    }
    if (states.length > 0 && selectedState === '') {
      setSelectedState('All');
    }
    if (roles.length > 0 && selectedRole === '') {
      setSelectedRole('All');
    }
  }, [departments, states, roles]);

  useEffect(() => {
    if (departments.length === 0 || states.length === 0 || roles.length === 0) return;

    const fetchDepartmentData = async () => {
      setLoading(true);
      try {
        // Get all employees matching the selected filters
        let q = query(collection(db, 'employees'));
        
        // If department is selected, add to query
        if (selectedDepartment !== 'All') {
          q = query(q, where('department', '==', selectedDepartment));
        }
        
        // If state is selected, add to query
        if (selectedState !== 'All') {
          q = query(q, where('state', '==', selectedState));
        }
        
        // If role is selected, add to query
        if (selectedRole !== 'All') {
          q = query(q, where('role', '==', selectedRole));
        }

        const empSnap = await getDocs(q);
        const empData = empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDepartmentEmployees(empData);

        // Get mood data for these employees from chatResponses
        const moodSnap = await getDocs(collection(db, 'chatResponses'));
        console.log('Fetched chatResponses:', moodSnap.docs.map(doc => doc.data()));
        const moodCounts = {};
        const stateMoodCounts = {};
        const roleMoodCounts = {};
        const moodDetails = [];

        moodSnap.docs.forEach(doc => {
          const moodData = doc.data();
          const matchingEmployee = empData.find(emp => 
            String(emp.empId).trim() === String(moodData.employeeId).trim()
          );
          if (!matchingEmployee) {
            console.log('No matching employee for chatResponse:', moodData.employeeId, moodData);
          }
          
          // Convert Firestore timestamp to JS Date
          const moodTimestamp = moodData.timestamp?.toDate ? moodData.timestamp.toDate() : null;

          // Date filter logic
          let matchesDate = true;
          if (startDate) {
            matchesDate = matchesDate && moodTimestamp && moodTimestamp >= new Date(startDate);
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // inclusive
            matchesDate = matchesDate && moodTimestamp && moodTimestamp < end;
          }

          if (matchingEmployee && matchesDate) {
            const mood = moodData.mood || 'UNKNOWN';
            
            // Count for department chart
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            
            // Count for state chart
            const stateKey = `${matchingEmployee.state || 'Unknown'}`;
            stateMoodCounts[stateKey] = stateMoodCounts[stateKey] || {};
            stateMoodCounts[stateKey][mood] = (stateMoodCounts[stateKey][mood] || 0) + 1;
            
            // Count for role chart
            const roleKey = `${matchingEmployee.role || 'Unknown'}`;
            roleMoodCounts[roleKey] = roleMoodCounts[roleKey] || {};
            roleMoodCounts[roleKey][mood] = (roleMoodCounts[roleKey][mood] || 0) + 1;
            
            moodDetails.push({
              id: doc.id,
              empId: matchingEmployee.empId,
              name: matchingEmployee.name,
              department: matchingEmployee.department,
              state: matchingEmployee.state,
              role: matchingEmployee.role,
              mood: mood,
              elaboration: moodData.elaboration || '',
              timestamp: moodData.timestamp?.toDate() || null,
              date: moodData.timestamp?.toDate().toLocaleDateString() || 'Unknown',
              time: moodData.timestamp?.toDate().toLocaleTimeString() || 'Unknown',
              chat: moodData.chat,
            });
          }
        });

        // Sort mood details by timestamp (newest first)
        moodDetails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Filter mood details by date range
        const filteredMoodDetails = moodDetails.filter((item) => {
          let matchesDate = true;
          if (startDate) {
            matchesDate = matchesDate && item.timestamp && item.timestamp >= new Date(startDate);
          }
          if (endDate) {
            // Add 1 day to endDate to make it inclusive
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            matchesDate = matchesDate && item.timestamp && item.timestamp < end;
          }
          return matchesDate;
        });

        // Prepare department chart data
        const deptChartData = Object.keys(moodCounts).map(mood => ({
          name: mood,
          count: moodCounts[mood],
          color: getMoodColor(mood),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));

        // Prepare state chart data (for selected state)
        const stateChartData = selectedState !== 'All' 
          ? Object.keys(stateMoodCounts[selectedState] || {}).map(mood => ({
              name: mood,
              count: stateMoodCounts[selectedState][mood],
              color: getMoodColor(mood),
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            }))
          : [];

        // Prepare role chart data (for selected role)
        const roleChartData = selectedRole !== 'All'
          ? Object.keys(roleMoodCounts[selectedRole] || {}).map(mood => ({
              name: mood,
              count: roleMoodCounts[selectedRole][mood],
              color: getMoodColor(mood),
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            }))
          : [];

        setDepartmentMoodData(deptChartData);
        setStateMoodData(stateChartData);
        setRoleMoodData(roleChartData);
        setEmployeeMoodDetails(filteredMoodDetails);
        console.log('Department mood data:', deptChartData);
        console.log('State mood data:', stateChartData);
        console.log('Role mood data:', roleChartData);
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [selectedDepartment, selectedState, selectedRole, startDate, endDate]);

  useEffect(() => {
    setFilteredEmployeeMoodDetails(
      employeeMoodDetails.filter((item) => {
        // Text search
        const matchesText =
          (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.mood && item.mood.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.elaboration && item.elaboration.toLowerCase().includes(searchQuery.toLowerCase()));

        // Date filter
        let matchesDate = true;
        if (startDate) {
          matchesDate = matchesDate && item.timestamp && item.timestamp >= new Date(startDate);
        }
        if (endDate) {
          // Add 1 day to endDate to make it inclusive
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
          matchesDate = matchesDate && item.timestamp && item.timestamp < end;
        }

        return matchesText && matchesDate;
      })
    );
  }, [searchQuery, employeeMoodDetails, startDate, endDate]);

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

  const chartWidth = Math.max(Math.min(windowDimensions.width - 40, 350), 220);
  const chartHeight = 220;

  // Create refs for charts
  const departmentChartRef = useRef();
  const stateChartRef = useRef();
  const roleChartRef = useRef();
  
  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };

  const captureChartAsImage = async (chartRef) => {
    if (!chartRef?.current) {
      console.warn('Chart ref is not available');
      return null;
    }
    
    try {
      // Add a small delay to ensure the view is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the view's layout first
      return new Promise((resolve) => {
        chartRef.current.measure(async (x, y, width, height, pageX, pageY) => {
          try {
            const result = await captureRef(chartRef, {
              format: 'png',
              quality: 1,
              result: 'base64',
              width: width || 600,
              height: height || 400,
            });
            resolve(`data:image/png;base64,${result}`);
          } catch (e) {
            console.warn('Error capturing chart:', e);
            resolve(null);
          }
        });
      });
    } catch (e) {
      console.warn('Failed to capture chart:', e);
      return null;
    }
  };

  const exportToPDF = async () => {
    try {
      // Show loading indicator
      Alert.alert('Exporting PDF', 'Preparing your report...');
      
      // Capture charts as images
      let deptChartImage = null;
      let stateChartImage = null;
      let roleChartImage = null;
      
      try {
        deptChartImage = await captureChartAsImage(departmentChartRef);
        if (selectedState !== 'All') {
          stateChartImage = await captureChartAsImage(stateChartRef);
        }
        if (selectedRole !== 'All') {
          roleChartImage = await captureChartAsImage(roleChartRef);
        }
      } catch (error) {
        console.warn('Error capturing charts:', error);
        // Continue with PDF generation even if chart capture fails
      }

      // Create HTML content for PDF
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px;
                direction: ltr;
              }
              h1 { 
                color: #2c3e50; 
                text-align: center; 
                margin-bottom: 10px;
              }
              h2 { 
                color: #34495e; 
                margin-top: 25px; 
                border-bottom: 1px solid #eee; 
                padding-bottom: 5px; 
                font-size: 16px;
              }
              .chart-container { 
                margin: 20px 0; 
                text-align: center; 
                page-break-inside: avoid;
              }
              .chart-image {
                max-width: 100%;
                height: auto;
                margin: 10px 0;
                border: 1px solid #eee;
              }
              .chart-title { 
                font-weight: bold; 
                margin-bottom: 10px; 
                font-size: 14px;
              }
              .date-range { 
                margin: 10px 0; 
                text-align: center;
                font-style: italic; 
                color: #7f8c8d;
                font-size: 12px;
              }
              .mood-list {
                text-align: left; 
                margin: 10px 0 0 0;
                padding-left: 20px;
                list-style-type: none;
              }
              .mood-item {
                margin: 5px 0;
                font-size: 13px;
              }
              .report-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
              }
              .report-title {
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #2c3e50;
              }
              .report-subtitle {
                font-size: 14px;
                color: #666;
              }
              .summary-box {
                background: #f8f9fa;
                border-left: 4px solid #E31937;
                padding: 10px 15px;
                margin: 15px 0;
                border-radius: 0 4px 4px 0;
              }
              .summary-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #2c3e50;
              }
              .chart-placeholder {
                background: #f8f9fa;
                border: 1px dashed #ddd;
                padding: 20px;
                text-align: center;
                color: #7f8c8d;
                margin: 10px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div class="report-title">Employee Mood Analytics Report</div>
              <div class="report-subtitle">Generated on: ${new Date().toLocaleString('en-IN')}</div>
              <div class="date-range">
                ${startDate ? `From: ${formatDate(startDate)}` : ''}
                ${endDate ? ` To: ${formatDate(endDate)}` : ''}
                ${!startDate && !endDate ? 'All Time Data' : ''}
              </div>
            </div>
      `;

      // Add department chart
      if (departmentMoodData.length > 0) {
        const totalResponses = departmentMoodData.reduce((sum, item) => sum + item.count, 0);
        htmlContent += `
          <h2>${selectedDepartment === 'All' ? 'All Departments' : selectedDepartment} Mood Distribution</h2>
          <div class="chart-container">
            ${deptChartImage ? `<img src="${deptChartImage}" class="chart-image" alt="Department Mood Chart" />` : 
              '<div class="chart-placeholder">[Chart not available in this view]</div>'}
            <div class="summary-box">
              <div class="summary-title">Summary (Total Responses: ${totalResponses})</div>
              <ul class="mood-list">
                ${departmentMoodData.map(item => {
                  const percentage = totalResponses > 0 ? Math.round((item.count / totalResponses) * 100) : 0;
                  return `
                    <li class="mood-item" style="color: ${item.color};">
                      <strong>${item.name}:</strong> ${item.count} responses (${percentage}%)
                    </li>`;
                }).join('')}
              </ul>
            </div>
          </div>
        `;
      }

      // Add state chart if available
      if (stateMoodData.length > 0 && selectedState !== 'All') {
        const totalResponses = stateMoodData.reduce((sum, item) => sum + item.count, 0);
        htmlContent += `
          <h2>${selectedState} Mood Distribution</h2>
          <div class="chart-container">
            ${stateChartImage ? `<img src="${stateChartImage}" class="chart-image" alt="State Mood Chart" />` : 
              '<div class="chart-placeholder">[Chart not available in this view]</div>'}
            <div class="summary-box">
              <div class="summary-title">Summary (Total Responses: ${totalResponses})</div>
              <ul class="mood-list">
                ${stateMoodData.map(item => {
                  const percentage = totalResponses > 0 ? Math.round((item.count / totalResponses) * 100) : 0;
                  return `
                    <li class="mood-item" style="color: ${item.color};">
                      <strong>${item.name}:</strong> ${item.count} responses (${percentage}%)
                    </li>`;
                }).join('')}
              </ul>
            </div>
          </div>
        `;
      }

      // Add role chart if available
      if (roleMoodData.length > 0 && selectedRole !== 'All') {
        const totalResponses = roleMoodData.reduce((sum, item) => sum + item.count, 0);
        htmlContent += `
          <h2>${selectedRole} Mood Distribution</h2>
          <div class="chart-container">
            ${roleChartImage ? `<img src="${roleChartImage}" class="chart-image" alt="Role Mood Chart" />` : 
              '<div class="chart-placeholder">[Chart not available in this view]</div>'}
            <div class="summary-box">
              <div class="summary-title">Summary (Total Responses: ${totalResponses})</div>
              <ul class="mood-list">
                ${roleMoodData.map(item => {
                  const percentage = totalResponses > 0 ? Math.round((item.count / totalResponses) * 100) : 0;
                  return `
                    <li class="mood-item" style="color: ${item.color};">
                      <strong>${item.name}:</strong> ${item.count} responses (${percentage}%)
                    </li>`;
                }).join('')}
              </ul>
            </div>
          </div>
        `;
      }

      htmlContent += `
          </body>
        </html>
      `;

      // Generate PDF
      const result = await Print.printToFileAsync({
        html: htmlContent,
        width: 612, // 8.5in in points (72 dpi)
        height: 792, // 11in in points (72 dpi)
        base64: false
      });

      if (result && result.uri) {
        // Share the PDF
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Analytics Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        throw new Error('Failed to generate PDF: No URI returned');
      }
    } catch (e) {
      console.error('Failed to export PDF:', e);
      Alert.alert('Export Failed', `Failed to export PDF: ${e.message}`);
    }
  };

  const exportTableToCSV = async () => {
    try {
      if (filteredEmployeeMoodDetails.length === 0) {
        alert('No data to export');
        return;
      }

      // Generate HTML table content for better Excel formatting
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .question { font-weight: bold; color: #2c3e50; }
              .answer { margin-top: 4px; }
              .chat-section { margin-top: 8px; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>State</th>
                  <th>Role</th>
                  <th>Mood</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      filteredEmployeeMoodDetails.forEach(item => {
        // Format date and time properly
        const formattedDate = formatDate(item.timestamp || item.date);
        const formattedTime = formatTime(item.timestamp) || item.time || '';
        
        // Format comments to include both elaboration and chat data
        let comments = '';
        if (item.elaboration) {
          comments += `<div>${item.elaboration.replace(/\n/g, '<br>')}</div>`;
        }
        
        // Add chat data if available
        if (item.chat && typeof item.chat === 'object') {
          const chatEntries = Object.entries(item.chat);
          if (chatEntries.length > 0) {
            if (comments) comments += '<div class="chat-section">';
            comments += chatEntries.map(([question, answer]) => 
              `<div class="question">${question}</div><div class="answer">${answer.replace(/\n/g, '<br>')}</div>`
            ).join('');
            if (comments.includes('chat-section')) comments += '</div>';
          }
        }
        
        htmlContent += `
          <tr>
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>${item.empId || ''}</td>
            <td>${(item.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td>${(item.department || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td>${(item.state || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td>${(item.role || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td>${(item.mood || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td>${comments || ''}</td>
          </tr>
        `;
      });

      htmlContent += `
              </tbody>
            </table>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // For web platform - create HTML file
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `employee_mood_data_${new Date().toISOString().split('T')[0]}.html`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile platforms - create HTML file
        const fileUri = FileSystem.documentDirectory + `employee_mood_data_${new Date().toISOString().split('T')[0]}.html`;
        
        // Write the file
        FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        }).then(() => {
          // Share the file
          Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: 'Export Mood Data',
            UTI: 'public.html'
          });
        });
      }
    } catch (e) {
      alert('Failed to export data: ' + e.message);
    }
  };

  return (
    <View style={styles.content}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-start',
          marginBottom: 10,
          width: '100%',
        }}
      >
        <Text style={styles.heading}>Employee Analytics</Text>
        <View
          style={{
            flexDirection: 'column',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            marginTop: isMobile ? 10 : 0,
            width: isMobile ? '100%' : undefined,
          }}
        >
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: '#2c3e50', padding: 8, marginBottom: 8 }
            ]}
            onPress={exportToPDF}
          >
            <Text style={styles.addButtonText}>Export Charts (PDF)</Text>
          </TouchableOpacity>
          {showEmployeeDetails && (
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: '#27ae60', padding: 8 }
              ]}
              onPress={exportTableToCSV}
            >
              <Text style={styles.addButtonText}>Export Table (HTML)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.chartControls} className="chartControls">
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ marginBottom: 5 }}>Department:</Text>
          <Picker
            selectedValue={selectedDepartment}
            style={styles.departmentPicker}
            onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
          >
            <Picker.Item label="All Departments" value="All" />
            {departments.map((dept, index) => (
              <Picker.Item key={`dept-${index}`} label={dept} value={dept} />
            ))}
          </Picker>
        </View>
        
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ marginBottom: 5 }}>State:</Text>
          <Picker
            selectedValue={selectedState}
            style={styles.departmentPicker}
            onValueChange={(itemValue) => setSelectedState(itemValue)}
          >
            <Picker.Item label="All States" value="All" />
            {states.map((state, index) => (
              <Picker.Item key={`state-${index}`} label={state} value={state} />
            ))}
          </Picker>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 5 }}>Role:</Text>
          <Picker
            selectedValue={selectedRole}
            style={styles.departmentPicker}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
          >
            <Picker.Item label="All Roles" value="All" />
            {roles.map((role, index) => (
              <Picker.Item key={`role-${index}`} label={role} value={role} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }} className="searchBar">
        <Text>Start Date: </Text>
        <TextInput
          style={[styles.input, { width: 120, marginRight: 10 }]}
          placeholder="YYYY-MM-DD"
          value={startDate || ''}
          onChangeText={setStartDate}
        />
        <Text>End Date: </Text>
        <TextInput
          style={[styles.input, { width: 120, marginRight: 10 }]}
          placeholder="YYYY-MM-DD"
          value={endDate || ''}
          onChangeText={setEndDate}
        />
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            // This will trigger the filter (see next step)
            setShowEmployeeDetails(true);
          }}
        >
          <Text style={styles.detailButtonText}>Filter by Date</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={{ flexDirection: windowDimensions.width > 768 ? 'row' : 'column', justifyContent: 'space-between' }}>
            <View ref={departmentChartRef} collapsable={false} style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>
                {selectedDepartment === 'All' ? 'All Departments' : selectedDepartment}
              </Text>
              {departmentMoodData.length > 0 ? (
                <PieChart
                  data={departmentMoodData}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={{
                    ...chartConfig,
                    style: {
                      borderRadius: 16
                    }
                  }}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.chart}
                />
              ) : (
                <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
                  No mood data available
                </Text>
              )}
            </View>

            {selectedState !== 'All' && (
              <View style={[styles.chartContainer, { flex: 1, marginLeft: windowDimensions.width > 768 ? 10 : 0 }]}>
                <Text style={styles.sectionTitle}>
                  {selectedState} Mood Distribution
                </Text>
                {stateMoodData.length > 0 ? (
                  <View ref={stateChartRef} collapsable={false}>
                    <PieChart
                      data={stateMoodData}
                      width={chartWidth}
                      height={chartHeight}
                      chartConfig={{
                        ...chartConfig,
                        style: {
                          borderRadius: 16
                        }
                      }}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                      style={styles.chart}
                    />
                  </View>
                ) : (
                  <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
                    No mood data available for {selectedState}
                  </Text>
                )}
              </View>
            )}

            {selectedRole !== 'All' && (
              <View style={[styles.chartContainer, { flex: 1, marginLeft: windowDimensions.width > 768 ? 10 : 0, marginTop: windowDimensions.width > 768 ? 0 : 15 }]}>
                <Text style={styles.sectionTitle}>
                  {selectedRole} Mood Distribution
                </Text>
                {roleMoodData.length > 0 ? (
                  <View ref={roleChartRef} collapsable={false}>
                    <PieChart
                      data={roleMoodData}
                      width={chartWidth}
                      height={chartHeight}
                      chartConfig={{
                        ...chartConfig,
                        style: {
                          borderRadius: 16
                        }
                      }}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                      style={styles.chart}
                    />
                  </View>
                ) : (
                  <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
                    No mood data available for {selectedRole}
                  </Text>
                )}
              </View>
            )}
          </View>

          {showEmployeeDetails && (
            <>
              <TextInput
                style={styles.searchBar}
                placeholder="Search by name, mood, or comments..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View style={styles.feedbackContainer}>
                <View style={styles.feedbackHeader}>
                  <View>
                    <Text style={styles.feedbackTitle}>Employee Feedback</Text>
                    <Text style={styles.resultCount}>
                      {filteredEmployeeMoodDetails.length} records found
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.exportButton}
                    onPress={exportToCSV}
                    disabled={filteredEmployeeMoodDetails.length === 0}
                  >
                    <MaterialIcons name="file-download" size={20} color="#fff" />
                    <Text style={styles.exportButtonText}>Export to CSV</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={{ minWidth: windowDimensions.width - 40 }}>
                    <View style={styles.tableHeader}>
                      <View style={[styles.headerCell, { width: Math.max(150, (windowDimensions.width - 40) * 0.15) }]}>
                        <Text style={styles.headerCellText}>Employee</Text>
                      </View>
                      <View style={[styles.headerCell, { width: Math.max(120, (windowDimensions.width - 40) * 0.12) }]}>
                        <Text style={styles.headerCellText}>Department</Text>
                      </View>
                      <View style={[styles.headerCell, { width: Math.max(100, (windowDimensions.width - 40) * 0.10) }]}>
                        <Text style={styles.headerCellText}>Mood</Text>
                      </View>
                      <View style={[styles.headerCell, { width: Math.max(300, (windowDimensions.width - 40) * 0.35) }]}>
                        <Text style={styles.headerCellText}>Comments</Text>
                      </View>
                      <View style={[styles.headerCell, { width: Math.max(100, (windowDimensions.width - 40) * 0.10) }]}>
                        <Text style={styles.headerCellText}>Time</Text>
                      </View>
                      <View style={[styles.headerCell, { width: Math.max(120, (windowDimensions.width - 40) * 0.12) }]}>
                        <Text style={styles.headerCellText}>Date</Text>
                      </View>
                    </View>
                    
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E31937" />
                        <Text style={styles.loadingText}>Loading feedback data...</Text>
                      </View>
                    ) : filteredEmployeeMoodDetails.length > 0 ? (
                      filteredEmployeeMoodDetails.map((item, index) => (
                        <View 
                          key={`${item.id}-${index}`} 
                          style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.evenRow : styles.oddRow,
                            { height: 'auto' }
                          ]}
                        >
                          <View style={[styles.cell, { width: Math.max(150, (windowDimensions.width - 40) * 0.15) }]}>
                            <Text style={[styles.cellText, { fontWeight: '500' }]} numberOfLines={1}>
                              {item.name || 'Unknown'}
                            </Text>
                            <Text style={[styles.cellText, { fontSize: 11, color: '#666' }]} numberOfLines={1}>
                              ID: {item.empId || 'N/A'}
                            </Text>
                          </View>
                          
                          <View style={[styles.cell, { width: Math.max(120, (windowDimensions.width - 40) * 0.12) }]}>
                            <Text style={styles.cellText} numberOfLines={1}>
                              {item.department || 'N/A'}
                            </Text>
                          </View>
                          
                          <View style={[styles.cell, { width: Math.max(100, (windowDimensions.width - 40) * 0.10), alignItems: 'center' }]}>
                            <View 
                              style={[
                                styles.moodBadge,
                                { backgroundColor: `${getMoodColor(item.mood)}20` }
                              ]}
                            >
                              <Text 
                                style={[
                                  styles.moodText,
                                  { color: getMoodColor(item.mood) }
                                ]}
                                numberOfLines={1}
                              >
                                {item.mood || 'N/A'}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={[styles.cell, { width: Math.max(300, (windowDimensions.width - 40) * 0.35), padding: 8 }]}>
                            {item.chat ? (
                              <View>
                                    <Text style={[styles.feedbackText, { fontWeight: 'bold', color: '#E31937', marginBottom: 4, fontSize: 12 }]}>
                                      Employee ID: {item.empId || 'N/A'}
                                    </Text>
                                    {Object.entries(item.chat).map(([question, answer], idx) => (
                                      <View key={idx} style={{ marginBottom: 8 }}>
                                        <Text style={[styles.feedbackText, { fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 }]}>
                                          {question}
                                        </Text>
                                        <Text style={[styles.feedbackText, { marginLeft: 8, color: '#555' }]}>
                                          {answer}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                            ) : (
                              <Text style={[styles.feedbackText, { fontStyle: 'italic', color: '#888' }]}>No comments</Text>
                            )}
                          </View>
                          
                          <View style={[styles.cell, { width: Math.max(100, (windowDimensions.width - 40) * 0.10), justifyContent: 'center' }]}>
                            <Text style={styles.cellText}>
                              {item.time || '--:--'}
                            </Text>
                          </View>
                          
                          <View style={[styles.cell, { width: Math.max(120, (windowDimensions.width - 40) * 0.12), justifyContent: 'center' }]}>
                            <Text style={styles.cellText}>
                              {item.date || '--/--/----'}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noDataContainer}>
                        <MaterialIcons name="feedback" size={48} color="#ddd" />
                        <Text style={styles.noDataText}>No feedback data found</Text>
                        <Text style={styles.noDataSubtext}>Try adjusting your filters or check back later</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    setFilteredAdmins(
      admins.filter(
        (admin) =>
          (admin.username && admin.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, admins]);

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

      // Validate that all required fields are filled
      if (!username || !email || !password) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }

      // Trim whitespace from all fields
      const trimmedAdmin = {
        username: username.trim(),
        email: email.trim(),
        password: password.trim()
      };

      // Check if any field is empty after trimming
      if (!trimmedAdmin.username || !trimmedAdmin.email || !trimmedAdmin.password) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }

      await updateDoc(doc(db, 'register', id), trimmedAdmin);
      setEditModalVisible(false);
      fetchAdmins();
      alert('Admin updated successfully');
    } catch (e) {
      alert('Failed to update admin');
    }
  };

  const handleAddAdmin = async () => {
    try {
      const { username, email, password } = newAdmin;

      // Validate that all required fields are filled
      if (!username || !email || !password) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }

      // Trim whitespace from all fields
      const trimmedAdmin = {
        username: username.trim(),
        email: email.trim(),
        password: password.trim()
      };

      // Check if any field is empty after trimming
      if (!trimmedAdmin.username || !trimmedAdmin.email || !trimmedAdmin.password) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }

      // Check if admin with the same username or email already exists
      const usernameQuery = query(collection(db, 'register'), where('username', '==', trimmedAdmin.username));
      const emailQuery = query(collection(db, 'register'), where('email', '==', trimmedAdmin.email));

      const [usernameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(emailQuery),
      ]);

      if (!usernameSnapshot.empty) {
        alert('Admin with this username already exists.');
        return;
      }

      if (!emailSnapshot.empty) {
        alert('Admin with this email already exists.');
        return;
      }

      await addDoc(collection(db, 'register'), trimmedAdmin);
      setAddModalVisible(false);
      setNewAdmin({ username: '', email: '', password: '' });
      fetchAdmins();
      alert('Admin added successfully');
    } catch (e) {
      alert('Failed to add admin');
    }
  };

  if (loading) return <ActivityIndicator size="large" />;
  const exportToCSV = async () => {
    try {
      // Generate CSV content
      const headers = ['Username', 'Email', 'Password'];
      let csvContent = headers.join(',') + '\n';
      
      admins.forEach(admin => {
        const row = [
          `"${admin.username || ''}"`,
          `"${admin.email || ''}"`,
          `"${admin.password || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      if (Platform.OS === 'web') {
        // For web platform
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'admin_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile platforms
        const fileUri = FileSystem.documentDirectory + 'admin_report.csv';
        
        // Write the file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Admin Data',
          UTI: 'public.comma-separated-values-text'
        });
      }
    } catch (e) {
      alert('Failed to export data: ' + e.message);
    }
  };

  return (
    <View style={styles.adminProfileContainer}>
      <View style={[styles.adminHeader, {justifyContent: 'space-between'}]}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Admin Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, {backgroundColor: '#4CAF50'}]}
          onPress={exportToCSV}
        >
          <Text style={styles.addButtonText}>Export to CSV</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Admin Profile</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by username or email..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.adminTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.usernameCell]}>Username</Text>
            <Text style={[styles.tableHeaderCell, styles.emailCell]}>Email</Text>
            <Text style={[styles.tableHeaderCell, styles.passwordCell]}>Password</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>EDIT</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>DELETE</Text>
          </View>

          {filteredAdmins.length === 0 ? (
            <View style={styles.noDataRow}>
              <Text style={styles.noDataText}>No admins found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAdmins}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.usernameCell]}>{item.username}</Text>
                  <Text style={[styles.tableCell, styles.emailCell]}>{item.email}</Text>
                  <Text style={[styles.tableCell, styles.passwordCell]}>{item.password}</Text>
                  <View style={[styles.tableCell, styles.actionCell]}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={styles.actionButtonText}>EDIT</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.tableCell, styles.actionCell]}>
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
      </ScrollView>

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

const EmployeeList = () => {
  const exportToCSV = async () => {
    try {
      // Generate CSV content
      const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Email', 'State', 'Contact Number'];
      let csvContent = headers.join(',') + '\n';
      
      employees.forEach(emp => {
        const row = [
          `"${emp.empId || ''}"`,
          `"${emp.name || ''}"`,
          `"${emp.department || ''}"`,
          `"${emp.role || ''}"`,
          `"${emp.email || ''}"`,
          `"${emp.state || ''}"`,
          `"${emp.contactNumber || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      if (Platform.OS === 'web') {
        // For web platform
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'employee_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile platforms
        const fileUri = FileSystem.documentDirectory + 'employee_report.csv';
        
        // Write the file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Employee Data',
          UTI: 'public.comma-separated-values-text'
        });
      }
    } catch (e) {
      alert('Failed to export data: ' + e.message);
    }
  };
  
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    empId: '',
    name: '',
    department: '',
    role: '',
    state: '',
    email: '',
    contactNumber: ''
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

  useEffect(() => {
    setFilteredEmployees(
      employees.filter(
        (employee) =>
          (employee.name && employee.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.empId && String(employee.empId).toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.role && employee.role.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, employees]);

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
      const { id, empId, name, department, role, state, email, contactNumber } = editData;
      
      // Validate that all required fields are filled
      if (!empId || !name || !department || !role || !state || !email || !contactNumber) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }
      
      // Trim whitespace from all fields
      const trimmedEmployee = {
        empId: empId.trim(),
        name: name.trim(),
        department: department.trim(),
        role: role.trim(),
        state: state.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim()
      };
      
      // Check if any field is empty after trimming
      if (!trimmedEmployee.empId || !trimmedEmployee.name || !trimmedEmployee.department || 
          !trimmedEmployee.role || !trimmedEmployee.state || !trimmedEmployee.email || !trimmedEmployee.contactNumber) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }
      
      // Validate contact number format
      const contactNumberRegex = /^\d{10}$/;
      if (!contactNumberRegex.test(trimmedEmployee.contactNumber)) {
        alert('Contact number must be exactly 10 digits and contain only numbers.');
        return;
      }
      
      await updateDoc(doc(db, 'employees', id), { 
        ...trimmedEmployee,
        email: trimmedEmployee.email.toLowerCase(), // Store email in lowercase for consistency
        department: trimmedEmployee.department.toLowerCase(), // Store department in lowercase
        state: trimmedEmployee.state.toLowerCase(), // Store state in lowercase
        role: trimmedEmployee.role.toLowerCase() // Store role in lowercase
      });
      setEditModalVisible(false);
      fetchEmployees();
      alert('Employee updated successfully');
    } catch (e) {
      alert('Failed to update employee');
    }
  };

  const handleAddEmployee = async () => {
    try {
      const { empId, name, department, role, state, email, contactNumber } = newEmployee;
      
      // Validate that all required fields are filled
      if (!empId || !name || !department || !role || !state || !email || !contactNumber) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }
      
      // Trim whitespace from all fields
      const trimmedEmployee = {
        empId: empId.trim(),
        name: name.trim(),
        department: department.trim(),
        role: role.trim(),
        state: state.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim()
      };
      
      // Check if any field is empty after trimming
      if (!trimmedEmployee.empId || !trimmedEmployee.name || !trimmedEmployee.department || 
          !trimmedEmployee.role || !trimmedEmployee.state || !trimmedEmployee.email || !trimmedEmployee.contactNumber) {
        alert('Please fill in all fields. All fields are required.');
        return;
      }
      
      // Validate contact number format
      const contactNumberRegex = /^\d{10}$/;
      if (!contactNumberRegex.test(trimmedEmployee.contactNumber)) {
        alert('Contact number must be exactly 10 digits and contain only numbers.');
        return;
      }
      
      // Check if employee with the same ID already exists
      const empIdQuery = query(collection(db, 'employees'), where('empId', '==', trimmedEmployee.empId));
      const empIdSnapshot = await getDocs(empIdQuery);
      if (!empIdSnapshot.empty) {
        alert('Employee with this ID already exists.');
        return;
      }
      
      // Check if employee with the same email already exists
      const emailQuery = query(collection(db, 'employees'), where('email', '==', trimmedEmployee.email.toLowerCase()));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        alert('Employee with this email already exists.');
        return;
      }
      
      // Add the employee to the database
      await setDoc(doc(db, 'employees', trimmedEmployee.empId), {
        ...trimmedEmployee,
        email: trimmedEmployee.email.toLowerCase(), // Store email in lowercase for consistency
        department: trimmedEmployee.department.toLowerCase(), // Store department in lowercase
        state: trimmedEmployee.state.toLowerCase(), // Store state in lowercase
        role: trimmedEmployee.role.toLowerCase() // Store role in lowercase
      });
      
      // Reset form and refresh the list
      setAddModalVisible(false);
      setNewEmployee({ 
        empId: '', 
        name: '', 
        department: '', 
        role: '',
        state: '',
        email: '',
        contactNumber: ''
      });
      
      fetchEmployees();
      alert('Employee added successfully');
    } catch (e) {
      alert('Failed to add employee. Please try again.');
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.adminProfileContainer}>
      <View style={[styles.adminHeader, {justifyContent: 'space-between'}]}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, {backgroundColor: '#4CAF50'}]}
          onPress={exportToCSV}
        >
          <Text style={styles.addButtonText}>Export to CSV</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Employee Data</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by ID, name, department, or role..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.adminTable}>
          <View style={[styles.tableHeader, {minWidth: 1100}]}>
            <Text style={[styles.tableHeaderCell, {width: 80}]}>ID</Text>
            <Text style={[styles.tableHeaderCell, {width: 150}]}>Name</Text>
            <Text style={[styles.tableHeaderCell, {width: 120}]}>Department</Text>
            <Text style={[styles.tableHeaderCell, {width: 150}]}>Role</Text>
            <Text style={[styles.tableHeaderCell, {width: 200}]}>Email</Text>
            <Text style={[styles.tableHeaderCell, {width: 120}]}>State</Text>
            <Text style={[styles.tableHeaderCell, {width: 120}]}>Contact</Text>
            <Text style={[styles.tableHeaderCell, {width: 80}]}>EDIT</Text>
            <Text style={[styles.tableHeaderCell, {width: 100}]}>DELETE</Text>
          </View>

          {filteredEmployees.length === 0 ? (
            <View style={styles.noDataRow}>
              <Text style={styles.noDataText}>No employees found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.tableRow, {minWidth: 1100}]}>
                  <Text style={[styles.tableCell, {width: 80}]}>{item.empId || item.id}</Text>
                  <Text style={[styles.tableCell, {width: 150}]}>{item.name}</Text>
                  <Text style={[styles.tableCell, {width: 120}]}>{item.department}</Text>
                  <Text style={[styles.tableCell, {width: 150}]}>{item.role}</Text>
                  <Text style={[styles.tableCell, {width: 200}]} numberOfLines={1} ellipsizeMode="tail">{item.email || 'N/A'}</Text>
                  <Text style={[styles.tableCell, {width: 120}]}>{item.state || 'N/A'}</Text>
                  <Text style={[styles.tableCell, {width: 120}]}>{item.contactNumber || 'N/A'}</Text>
                  <View style={[styles.tableCell, {width: 80, paddingVertical: 5}]}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton, {padding: 5}]}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={[styles.actionButtonText, {fontSize: 12}]}>EDIT</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.tableCell, {width: 100, paddingVertical: 5}]}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton, {padding: 5}]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={[styles.actionButtonText, {fontSize: 12}]}>DELETE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

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
            <TextInput
              style={styles.input}
              value={editData?.email}
              onChangeText={txt => setEditData({ ...editData, email: txt })}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={editData?.state}
              onChangeText={txt => setEditData({ ...editData, state: txt })}
              placeholder="State"
            />
            <TextInput
              style={styles.input}
              value={editData?.contactNumber}
              onChangeText={txt => setEditData({ ...editData, contactNumber: txt })}
              placeholder="Contact Number"
              keyboardType="phone-pad"
            />
            <View style={styles.buttonRow}>
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" color="#E31937" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
      
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
            <TextInput
              style={styles.input}
              value={newEmployee.email}
              onChangeText={txt => setNewEmployee({ ...newEmployee, email: txt })}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.state}
              onChangeText={txt => setNewEmployee({ ...newEmployee, state: txt })}
              placeholder="State"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.contactNumber}
              onChangeText={txt => setNewEmployee({ ...newEmployee, contactNumber: txt })}
              placeholder="Contact Number"
              keyboardType="phone-pad"
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
export default AdminPanel;