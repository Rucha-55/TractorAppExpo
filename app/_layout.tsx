import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { db } from '../config/firebase';
import NotificationService from '../services/NotificationService';

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

  // Initialize notifications when app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await NotificationService.initializeNotifications();
        console.log('Notification service initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    if (firebaseInitialized) {
      initializeNotifications();
    }
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
