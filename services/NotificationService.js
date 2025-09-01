import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

// Define the background task name
const NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Register the background task
TaskManager.defineTask(NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
  if (error) {
    console.error('Task error:', error);
    return;
  }
  console.log('Background task executed:', data);
});

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.INSTALL_DATE_KEY = 'app_install_date';
    this.NOTIFICATION_SCHEDULED_KEY = 'notification_scheduled';
    this.LAST_NOTIFICATION_DATE = 'last_notification_date';
  }

  // Initialize notifications and schedule daily ones
  async initializeNotifications() {
    try {
      const installDate = await AsyncStorage.getItem(this.INSTALL_DATE_KEY);
      
      if (!installDate) {
        // First time installation
        const currentDate = new Date().toISOString();
        await AsyncStorage.setItem(this.INSTALL_DATE_KEY, currentDate);
      }
      
      // Always reschedule to ensure notifications are active
      await this.scheduleDailyNotification();
      console.log('Notifications initialized');
      
      // Register for background tasks
      await this.registerBackgroundTasks();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }
  
  // Register background tasks
  async registerBackgroundTasks() {
    try {
      // Check if task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK);
      
      if (!isRegistered) {
        // Register the task
        await Notifications.registerTaskAsync(NOTIFICATION_TASK, {
          minimumInterval: 60 * 60 * 24, // 24 hours in seconds
          stopOnTerminate: false, // Continue even if app is terminated
          startOnBoot: true, // Start task when device boots
        });
        console.log('Background task registered');
      }
    } catch (error) {
      console.error('Error registering background task:', error);
    }
  }

  // Schedule daily notification
  async scheduleDailyNotification() {
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      // Create a notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Schedule the daily notification at 10 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Update",
          body: "Check out today's updates in the app!",
          data: { type: 'daily' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: 10,
          minute: 0,
          repeats: true,
          channelId: 'default',
        },
      });

      console.log('Daily notification scheduled for 10 AM');
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(this.LAST_NOTIFICATION_DATE, today);
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
    }
  }

  // Schedule single notification (kept for backward compatibility)
  async scheduleSingleNotification() {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Random delay between 2-5 days
      const randomDays = 2 + Math.floor(Math.random() * 4); // 2, 3, 4, or 5 days
      const delayInSeconds = randomDays * 24 * 60 * 60;

      // Schedule single notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Welcome to mDojo! 💬',
          body: 'Your employee feedback chatbot is ready. Share your thoughts and help us improve!',
          data: { type: 'welcome-reminder', days: randomDays },
        },
        trigger: {
          seconds: delayInSeconds,
        },
        identifier: 'mdojo_welcome_notification',
      });

      // Mark notification as scheduled
      await AsyncStorage.setItem(this.NOTIFICATION_SCHEDULED_KEY, 'true');
      
      console.log(`Single notification scheduled for ${randomDays} days from now`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Schedule a custom notification for testing
  async scheduleCustomNotification(title, body, delayInSeconds) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'custom' },
        },
        trigger: {
          seconds: delayInSeconds,
        },
      });

      console.log('Custom notification scheduled');
    } catch (error) {
      console.error('Error scheduling custom notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Add notification listener
  addNotificationListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService(); 