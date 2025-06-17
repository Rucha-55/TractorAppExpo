import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
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
  // ... (keep all your existing styles)
  // Add these new styles:
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
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    switch(mood.toUpperCase()) {
      case 'GLAD': return '#2ecc71';
      case 'MAD': return '#3498db';
      case 'SAD': return '#e74c3c';
      case 'NEUTRAL': return '#f39c12';
      case 'EXCITED': return '#9b59b6';
      default: return '#95a5a6';
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
        return <DepartmentCharts />;
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
      </SafeAreaView>
    );
};

const DepartmentCharts = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentMoodData, setDepartmentMoodData] = useState([]);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [employeeMoodDetails, setEmployeeMoodDetails] = useState([]);
  const [filteredEmployeeMoodDetails, setFilteredEmployeeMoodDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Get unique departments from employees
        const empSnap = await getDocs(collection(db, 'employees'));
        const depts = new Set();
        empSnap.docs.forEach(doc => {
          const dept = doc.data().department;
          if (dept) depts.add(dept);
        });
        setDepartments(Array.from(depts));
        if (depts.size > 0) {
          setSelectedDepartment(Array.from(depts)[0]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchDepartmentData = async () => {
      setLoading(true);
      try {
        // Get all employees in selected department
        const q = query(collection(db, 'employees'), where('department', '==', selectedDepartment));
        const empSnap = await getDocs(q);
        const empData = empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDepartmentEmployees(empData);

        // Get mood data for these employees from chatResponses
        const moodSnap = await getDocs(collection(db, 'chatResponses'));
        const moodCounts = {};
        const moodDetails = [];

        moodSnap.docs.forEach(doc => {
          const moodData = doc.data();
          const matchingEmployee = empData.find(emp => emp.empId === moodData.empId);
          
          if (matchingEmployee) {
            const mood = moodData.mood || 'UNKNOWN';
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            
            moodDetails.push({
              id: doc.id,
              empId: moodData.empId,
              name: matchingEmployee.name,
              department: selectedDepartment,
              mood: mood,
              elaboration: moodData.elaboration || '',
              timestamp: moodData.timestamp?.toDate() || null,
              date: moodData.timestamp?.toDate().toLocaleDateString() || 'Unknown',
              time: moodData.timestamp?.toDate().toLocaleTimeString() || 'Unknown'
            });
          }
        });

        // Sort mood details by timestamp (newest first)
        moodDetails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Prepare chart data
        const chartData = Object.keys(moodCounts).map(mood => ({
          name: mood,
          count: moodCounts[mood],
          color: getMoodColor(mood),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));

        setDepartmentMoodData(chartData);
        setEmployeeMoodDetails(moodDetails);
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [selectedDepartment]);

  useEffect(() => {
    setFilteredEmployeeMoodDetails(
      employeeMoodDetails.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.mood && item.mood.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.elaboration && item.elaboration.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, employeeMoodDetails]);

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

  return (
    <View style={styles.content}>
      <Text style={styles.heading}>Department Analytics</Text>
      
      <View style={styles.chartControls}>
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 5 }}>Select Department:</Text>
         <Picker
  selectedValue={selectedDepartment}
  style={styles.departmentPicker}
  onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
>
  {departments.map((dept, index) => (
    <Picker.Item key={index} label={dept} value={dept} />
  ))}
</Picker>
        </View>
        
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => setShowEmployeeDetails(!showEmployeeDetails)}
        >
          <Text style={styles.detailButtonText}>
            {showEmployeeDetails ? 'Hide Details' : 'Show Mood Details'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {departmentMoodData.length > 0 ? (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>
                Mood Distribution in {selectedDepartment}
              </Text>
              <PieChart
                data={departmentMoodData}
                width={Math.min(Dimensions.get('window').width - 40, 350)}
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
          ) : (
            <Text style={{ textAlign: 'center', marginVertical: 20 }}>
              No mood data available for {selectedDepartment} department
            </Text>
          )}

          {showEmployeeDetails && (
            <>
              <TextInput
                style={styles.searchBar}
                placeholder="Search by name, mood, or comments..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View style={styles.employeeMoodTable}>
              <ScrollView horizontal>
                <View>
                  <View style={styles.moodTableHeader}>
                    <Text style={[styles.moodHeaderCell, styles.moodNameCell]}>Employee</Text>
                    <Text style={[styles.moodHeaderCell, styles.moodDepartmentCell]}>Department</Text>
                    <Text style={[styles.moodHeaderCell, styles.moodMoodCell]}>Mood</Text>
                    <Text style={[styles.moodHeaderCell, styles.moodElaborationCell]}>Comments</Text>
                    <Text style={[styles.moodHeaderCell, styles.moodDateCell]}>Date</Text>
                    <Text style={[styles.moodHeaderCell, styles.moodDateCell]}>Time</Text>
                  </View>
                  
                  {filteredEmployeeMoodDetails.length > 0 ? (
                    <FlatList
                      data={filteredEmployeeMoodDetails}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.moodRow}>
                          <Text style={[styles.moodTableCell, styles.moodNameCell]}>{item.name}</Text>
                          <Text style={[styles.moodTableCell, styles.moodDepartmentCell]}>{item.department}</Text>
                          <Text style={[
                            styles.moodTableCell, 
                            styles.moodMoodCell,
                            { color: getMoodColor(item.mood) }
                          ]}>
                            {item.mood}
                          </Text>
                          <Text style={[styles.moodTableCell, styles.moodElaborationCell]}>{item.elaboration}</Text>
                          <Text style={[styles.moodTableCell, styles.moodDateCell]}>{item.date}</Text>
                          <Text style={[styles.moodTableCell, styles.moodDateCell]}>{item.time}</Text>
                        </View>
                      )}
                    />
                  ) : (
                    <View style={{ padding: 20 }}>
                      <Text style={{ textAlign: 'center' }}>No mood responses found for this department</Text>
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

// ... (keep your existing AdminList and EmployeeList components)
const AdminList = () => {
  // ... (keep all your existing state and functions)
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
      const { username, email } = newAdmin;

      // Check if admin with the same username or email already exists
      const usernameQuery = query(collection(db, 'register'), where('username', '==', username));
      const emailQuery = query(collection(db, 'register'), where('email', '==', email));

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

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by username or email..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Horizontal Scroll Container - CHANGED TO ScrollView */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {/* Admin Table */}
        <View style={styles.adminTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.usernameCell]}>Username</Text>
            <Text style={[styles.tableHeaderCell, styles.emailCell]}>Email</Text>
            <Text style={[styles.tableHeaderCell, styles.passwordCell]}>Password</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>EDIT</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>DELETE</Text>
          </View>

          {/* Table Rows */}
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

      {/* ... (keep all your modal code) */}
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

const EmployeeList = () => {
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
      const { empId } = newEmployee;

      // Check if employee with the same empId already exists
      const empIdQuery = query(collection(db, 'employees'), where('empId', '==', empId));
      const empIdSnapshot = await getDocs(empIdQuery);

      if (!empIdSnapshot.empty) {
        alert('Employee with this ID already exists.');
        return;
      }

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

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by ID, name, department, or role..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Horizontal Scroll Container */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {/* Employee Table */}
        <View style={styles.adminTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.idCell]}>ID</Text>
            <Text style={[styles.tableHeaderCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableHeaderCell, styles.deptCell]}>Department</Text>
            <Text style={[styles.tableHeaderCell, styles.roleCell]}>Role</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>EDIT</Text>
            <Text style={[styles.tableHeaderCell, styles.actionCell]}>DELETE</Text>
          </View>

          {/* Table Rows */}
          {filteredEmployees.length === 0 ? (
            <View style={styles.noDataRow}>
              <Text style={styles.noDataText}>No employees found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.idCell]}>{item.empId || item.id}</Text>
                  <Text style={[styles.tableCell, styles.nameCell]}>{item.name}</Text>
                  <Text style={[styles.tableCell, styles.deptCell]}>{item.department}</Text>
                  <Text style={[styles.tableCell, styles.roleCell]}>{item.role}</Text>
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

      {/* Edit and Add Modals (same as before) */}
      {/* ... */}
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
export default AdminPanel;