import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, adminLogin } from '../config/firebase';

// Import LogBox to ignore specific warnings
import { LogBox } from 'react-native';
import { router } from 'expo-router';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Firebase', // Ignore all Firebase warnings
]);

// Persistence is enabled in the Firebase config file

const safeNavigate = (path) => {
  if (Platform.OS === 'web') {
    setTimeout(() => {
      router.push(path);
    }, 0);
  } else {
    router.push(path);
  }
};

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
const { width } = Dimensions.get('window');

// Initialize Firebase with the configuration from config/firebase.js

const LoginScreen = () => {
  const [loginMode, setLoginMode] = useState('employee'); // 'employee' or 'admin'
  const [employeeId, setEmployeeId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const checkEmployeeExists = async (empId) => {
    console.log('🔍 Checking employee with ID:', empId);
    try {
      // First, check if the ID is in the expected format
      if (!/^EMP0(0[1-9]|10)$/.test(empId)) {
        console.log('❌ Invalid employee ID format:', empId);
        return false;
      }

      // Check if the employee exists in Firestore
      const docRef = doc(db, 'employees', empId);
      console.log('📄 Document reference created for path:', docRef.path);
      
      const docSnap = await getDoc(docRef);
      const exists = docSnap.exists();
      console.log('📋 Document exists:', exists);
      
      if (!exists) {
        console.log(`❌ Employee ${empId} not found in database`);
        return false;
      }
      
      const employeeData = docSnap.data();
      console.log('✅ Employee found:', { id: docSnap.id, ...employeeData });
      
      // Check if the employee is active
      if (employeeData.active === false) {
        console.log('⛔ Employee is inactive:', empId);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔥 Error checking employee:', {
        code: error?.code || 'UNKNOWN_ERROR',
        message: error?.message || 'Unknown error occurred',
        details: error
      });
      return false;
    }
  };

  const handleLogin = async () => {
    const empId = employeeId.trim().toUpperCase();
    console.log('🔑 Attempting login with ID:', empId);
    
    try {
      // Basic validation
      if (!empId) {
        console.log('❌ No employee ID provided');
        
        showAlert('Error', 'Please enter your employee ID');
        return;
      }

      // Validate ID format (EMP001-EMP010)
      if (!/^EMP0(0[1-9]|10)$/.test(empId)) {
        console.log('❌ Invalid employee ID format:', empId);
      
        showAlert('Error', 'Invalid employee ID. Please enter a valid ID (EMP001-EMP010)');
        return;
      }

      setIsLoading(true);
      
      try {
        // Check if employee exists
        console.log('🔍 Verifying employee in database...');
        const employeeExists = await checkEmployeeExists(empId);
        
        if (!employeeExists) {
          console.log(`❌ Employee ${empId} not found or inactive`);
      
          showAlert('Access Denied', 'Employee ID not found or inactive. Please contact support.');
          return;
        }

        console.log('✅ Employee verified, recording login...');
        
        // Add login record to Firestore
        const loginData = {
          employeeId: empId,
          loginTime: serverTimestamp(),
          deviceInfo: {
            platform: Platform.OS,
            osVersion: Platform.Version ?? 'unknown',
            model: Platform.isTV ? 'TV' : 'Mobile',
            timestamp: new Date().toISOString()
          },
          status: 'success'
        };
        
        console.log('💾 Saving login data:', loginData);
        const docRef = await addDoc(collection(db, 'employee_logins'), loginData);
        console.log('📝 Login recorded with ID:', docRef.id);
        
        // Show loading state
        setIsLoading(true);
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        safeNavigate({ pathname: '/chat', params: { employeeId: empId } });

        
        // Reset loading state after navigation
        setIsLoading(false);
        setEmployeeId('');
        
      } catch (firebaseError) {
        console.error('🔥 Firestore error:', {
          code: firebaseError?.code,
          message: firebaseError?.message,
          details: firebaseError
        });
        
        // Log the failed attempt
        await addDoc(collection(db, 'employee_logins'), {
          employeeId: empId,
          loginTime: serverTimestamp(),
          status: 'failed',
          error: firebaseError?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        
        showAlert('Error', 'Unable to process your login. Please check your connection and try again.');
        
      }
      
    } catch (error) {
      console.error('❌ Unexpected error in handleLogin:', {
        error: error?.message || 'Unknown error',
        stack: error?.stack
      });
      
      
      showAlert('Unexpected Error', 'An unexpected error occurred. Please restart the app and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonAnimatedStyle = {
    transform: [{ scale: buttonScale }]
  };

  const containerAnimatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.logoContainer, containerAnimatedStyle]}>
          <Image
            source={require('../assets/images/mahindra-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Switcher */}
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchButton, loginMode === 'employee' && styles.switchButtonActive]}
            onPress={() => setLoginMode('employee')}
            activeOpacity={0.8}
          >
            <Text style={[styles.switchText, loginMode === 'employee' && styles.switchTextActive]}>Employee Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, loginMode === 'admin' && styles.switchButtonActive]}
            onPress={() => setLoginMode('admin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.switchText, loginMode === 'admin' && styles.switchTextActive]}>Admin Login</Text>
          </TouchableOpacity>
        </View>

        {/* Employee Login Form */}
        {loginMode === 'employee' && (
          <Animated.View style={[styles.loginContainer, containerAnimatedStyle]}>
            <Text style={styles.title}>Enter Employee ID!</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  isFocused && styles.inputFocused
                ]}
                placeholder="Enter employee ID..."
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholderTextColor="#999"
                autoCapitalize="none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        {/* Admin Login Form */}
        {loginMode === 'admin' && (
          <Animated.View style={[styles.loginContainer, containerAnimatedStyle]}>
            <Text style={styles.title}>Admin Login</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Email Address..."
                value={adminEmail}
                onChangeText={setAdminEmail}
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.loginButton, adminLoading && styles.disabledButton]}
                onPress={async () => {
                  setAdminLoading(true);
                  if (!adminEmail || !adminPassword) {
                    showAlert('Error', 'Please enter both email and password');
                    setAdminLoading(false);
                    return;
                  }
                  try {
                    // Firestore-based admin login
                    const result = await adminLogin(adminEmail, adminPassword);
                    setAdminLoading(false);
                    if (result.success) {
                      showAlert('Success', 'Admin login successful!');
                      safeNavigate('/adminpanel'); // Set your admin panel route
                    } else {
                      showAlert('Error', result.message || 'Invalid credentials');
                    }
                  } catch (error) {
                    setAdminLoading(false);
                    showAlert('Error', error.message || 'Login failed. Please try again.');
                  }
                }}
                disabled={adminLoading}
                activeOpacity={0.9}
              >
                {adminLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#fff',
    borderBottomColor: '#e31837',
    borderBottomWidth: 3,
  },
  switchText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  switchTextActive: {
    color: '#e31837',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 80,
  },
  loginContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#e31837',
    backgroundColor: '#f8f8f8',
  },
  loginButton: {
    backgroundColor: '#e31837',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;