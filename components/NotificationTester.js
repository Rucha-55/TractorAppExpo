import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationTester = () => {
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    const notifications = await NotificationService.getScheduledNotifications();
    setScheduledNotifications(notifications);
  };

  const testImmediateNotification = async () => {
    try {
      await NotificationService.scheduleCustomNotification(
        'Test Notification 🧪',
        'This is a test notification for mDojo employee feedback app!',
        5 // 5 seconds delay
      );
      Alert.alert('Success', 'Test notification scheduled for 5 seconds');
      setTimeout(loadScheduledNotifications, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule test notification');
    }
  };

  const scheduleSingleNotification = async () => {
    try {
      await NotificationService.scheduleSingleNotification();
      Alert.alert('Success', 'Single notification scheduled (2-5 days)');
      setTimeout(loadScheduledNotifications, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await NotificationService.cancelAllNotifications();
      Alert.alert('Success', 'All notifications cancelled');
      setScheduledNotifications([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notifications');
    }
  };

  const resetInstallDate = async () => {
    try {
      await AsyncStorage.removeItem('app_install_date');
      await AsyncStorage.removeItem('notification_scheduled');
      await AsyncStorage.removeItem('last_notification_date');
      Alert.alert('Success', 'Install date and notification history reset. Restart app to trigger notifications.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset install date');
    }
  };

  const testDailyNotification = async () => {
    try {
      // Schedule a test notification for 10 seconds from now
      const trigger = new Date();
      trigger.setSeconds(trigger.getSeconds() + 10);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Daily Notification',
          body: 'This is a test of the daily notification system!',
          data: { type: 'test-daily' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: trigger,
          channelId: 'default',
        },
      });
      
      Alert.alert('Success', 'Test daily notification scheduled for 10 seconds from now');
      setTimeout(loadScheduledNotifications, 1000);
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert('Error', 'Failed to schedule test notification');
    }
  };

  const scheduleDailyNotification = async () => {
    try {
      await NotificationService.scheduleDailyNotification();
      Alert.alert('Success', 'Daily notification scheduled for 10 AM');
      setTimeout(loadScheduledNotifications, 1000);
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
      Alert.alert('Error', 'Failed to schedule daily notification');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>mDojo Notification Tester</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This app will send ONE notification 2-5 days after installation.
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Daily Notifications</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testDailyNotification}>
          <Text style={styles.buttonText}>Test Daily Notification (10s)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={scheduleDailyNotification}>
          <Text style={styles.buttonText}>Schedule Daily at 10 AM</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Test Notifications</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testImmediateNotification}>
          <Text style={styles.buttonText}>Test Immediate (5s)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={scheduleSingleNotification}>
          <Text style={styles.buttonText}>Schedule Single (2-5 days)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={cancelAllNotifications}>
          <Text style={styles.buttonText}>Cancel All Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={resetInstallDate}>
          <Text style={styles.buttonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Scheduled Notifications:</Text>
        {scheduledNotifications.length === 0 ? (
          <Text style={styles.noNotifications}>No notifications scheduled</Text>
        ) : (
          scheduledNotifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>
                {notification.content.title}
              </Text>
              <Text style={styles.notificationBody}>
                {notification.content.body}
              </Text>
              <Text style={styles.notificationTime}>
                Scheduled for: {new Date(notification.trigger.seconds * 1000).toLocaleString()}
              </Text>
              <Text style={styles.notificationType}>
                Type: {notification.content.data?.type || 'unknown'}
                {notification.content.data?.days && ` (${notification.content.data.days} days)`}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    minWidth: '100%',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
    textAlign: 'center',
  },
  noNotifications: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  notificationType: {
    fontSize: 12,
    color: '#E31937',
    fontWeight: '500',
  },
});

export default NotificationTester; 