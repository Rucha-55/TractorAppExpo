import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

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
  }

  // Check if app is installed for first time and schedule notification
  async initializeNotifications() {
    try {
      const installDate = await AsyncStorage.getItem(this.INSTALL_DATE_KEY);
      
      if (!installDate) {
        // First time installation
        const currentDate = new Date().toISOString();
        await AsyncStorage.setItem(this.INSTALL_DATE_KEY, currentDate);
        
        // Schedule single notification for 2-5 days
        await this.scheduleSingleNotification();
        
        console.log('Single notification scheduled for new installation');
      } else {
        // Check if notification is already scheduled
        const scheduled = await AsyncStorage.getItem(this.NOTIFICATION_SCHEDULED_KEY);
        if (!scheduled) {
          await this.scheduleSingleNotification();
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Schedule single notification for 2-5 days after installation
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