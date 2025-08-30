import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import NotificationTester from '../components/NotificationTester';

export default function NotificationTestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <NotificationTester />
    </SafeAreaView>
  );
} 