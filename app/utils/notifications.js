import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions for notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Schedule a notification for feedback reminder
export async function scheduleFeedbackReminder() {
  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Set the notification to trigger between 5-6 days from now
  const daysToAdd = 5 + Math.floor(Math.random() * 2); // 5 or 6 days
  const trigger = new Date();
  trigger.setDate(trigger.getDate() + daysToAdd);
  
  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "We'd love your feedback! 💬",
      body: "How has your experience been with our app? Tap to share your thoughts!",
      data: { type: 'feedback-reminder' },
    },
    trigger: {
      date: trigger,
    },
  });
  
  console.log(`Scheduled feedback reminder for ${daysToAdd} days from now.`);
}

// Setup notification listeners
export function setupNotificationListeners(navigation) {
  // This listener is called when a notification is received while the app is in the foreground
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  // This listener is called when a user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response received:', response);
    // You can navigate to a feedback screen here if needed
    // navigation.navigate('Feedback');
  });

  // Return the subscription so it can be cleaned up
  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}
