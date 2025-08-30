import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import NotificationService from '../services/NotificationService';

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
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem('app_install_date');
      await AsyncStorage.removeItem('notification_scheduled');
      Alert.alert('Success', 'Install date reset. Restart app to trigger notification.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset install date');
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
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testImmediateNotification}>
          <Text style={styles.buttonText}>Test Notification (5 sec)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={scheduleSingleNotification}>
          <Text style={styles.buttonText}>Schedule Single Notification (2-5 days)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={cancelAllNotifications}>
          <Text style={styles.buttonText}>Cancel All Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetInstallDate}>
          <Text style={styles.buttonText}>Reset Install Date</Text>
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
    backgroundColor: '#E31937', // mDojo brand color
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
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
    marginBottom: 10,
    color: '#333',
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