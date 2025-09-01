import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox, Platform, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { db } from '../config/firebase';
import NotificationService from '../services/NotificationService';
import { NOTIFICATION_TASK, defineNotificationTask } from '../tasks';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Firebase', // Ignore all Firebase warnings
]);

// Error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorText}>{error?.message || 'Unknown error occurred'}</Text>
  </View>
);

// Loading component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={styles.loadingText}>Initializing app...</Text>
  </View>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  // Initialize Firebase when the app starts
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if Firebase is properly initialized
        if (!db) {
          throw new Error('Failed to initialize Firebase');
        }
        console.log('Firebase Firestore initialized successfully');
        setFirebaseInitialized(true);
      } catch (err) {
        console.error('Error initializing Firebase:', err);
        setInitializationError(err instanceof Error ? err : new Error('Unknown error initializing Firebase'));
      }
    };

    initializeFirebase();
  }, []);

  // Initialize notifications and background tasks when app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize notification service
        await NotificationService.initializeNotifications();
        
        // Define the background task
        defineNotificationTask();
        
        // Register background task
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
          
          // Register the background task for Android
          await Notifications.registerTaskAsync(NOTIFICATION_TASK);
          
          // Schedule a repeating trigger for the task (every 24 hours)
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'mDojo',
              body: 'Check your daily updates!',
              data: { type: 'background-task' },
            },
            trigger: {
              seconds: 60 * 60 * 24, // 24 hours
              repeats: true,
              channelId: 'default',
            },
          });
        }
        
        console.log('Notification service and background task initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    if (firebaseInitialized) {
      initializeNotifications();
    }
    
    // Cleanup function
    return () => {
      // Unregister the task when component unmounts
      if (Platform.OS === 'android') {
        Notifications.cancelAllScheduledNotificationsAsync();
        Notifications.unregisterTaskAsync(NOTIFICATION_TASK);
      }
    };
  }, [firebaseInitialized]);

  // Show loading state while fonts and Firebase are initializing
  if (!fontsLoaded || !firebaseInitialized) {
    return <LoadingFallback />;
  }

  // Show error state if initialization failed
  if (initializationError) {
    return <ErrorFallback error={initializationError} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="notification-test" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff0000',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
