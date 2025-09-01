import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Define the task that will be run in the background
export const defineNotificationTask = () => {
  TaskManager.defineTask(NOTIFICATION_TASK, async () => {
    try {
      console.log('Background notification task running...');
      
      // Check if notification was already sent today
      const lastNotification = await AsyncStorage.getItem('last_notification_date');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastNotification !== today) {
        console.log('Sending daily notification...');
        
        // Send a new notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Daily Update",
            body: "Check out today's updates in the app!",
            data: { type: 'daily' },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Send immediately
        });

        // Update last notification date
        await AsyncStorage.setItem('last_notification_date', today);
        console.log('Daily notification sent');
      } else {
        console.log('Notification already sent today');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in background task:', error);
      return { success: false, error };
    }
  });
};

// Call the function to define the task
defineNotificationTask();

// Export the task name as default
export default NOTIFICATION_TASK;
