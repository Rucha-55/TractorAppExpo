# mDojo Single Notification System Setup Guide

## Overview
This notification system automatically schedules **ONE notification** 2-5 days after app installation for the mDojo employee feedback chatbot app.

## Features
- **Single Notification**: Only one notification sent per user
- **Random Timing**: Notification triggers randomly between 2-5 days
- **Employee Feedback Focus**: Relevant message for employee feedback and chatbot usage
- **Testing Tools**: Debug and testing tools available
- **Simple & Clean**: No notification spam

## How It Works

### 1. Installation Detection
- When the app is opened for the first time, the install date is saved
- Uses AsyncStorage with key `app_install_date` to store the date

### 2. Single Notification Scheduling
- **Random Timing**: Notification is scheduled for 2, 3, 4, or 5 days randomly
- **One Time Only**: Each user receives only one notification after installation
- **Welcome Message**: Friendly introduction to mDojo employee feedback chatbot

### 3. Permissions
Android requires the following permissions:
```json
"permissions": [
  "POST_NOTIFICATIONS",
  "SCHEDULE_EXACT_ALARM", 
  "USE_EXACT_ALARM",
  "RECEIVE_BOOT_COMPLETED",
  "VIBRATE"
]
```

## Testing

### 1. Use NotificationTester Component
```javascript
import NotificationTester from '../components/NotificationTester';

// Add to your screen
<NotificationTester />
```

### 2. Test Options
- **Test Notification (5 sec)**: Immediate test notification
- **Schedule Single Notification (2-5 days)**: Manual single notification scheduling
- **Cancel All Notifications**: Cancel all scheduled notifications
- **Reset Install Date**: Reset install date (for testing)

### 3. Manual Testing Steps
1. Install the app
2. Open NotificationTester component
3. Press "Test Notification (5 sec)" button
4. Wait 5 seconds
5. Notification will appear

## Files Created/Modified

### New Files:
- `services/NotificationService.js` - Main notification service
- `components/NotificationTester.js` - Testing component
- `NOTIFICATION_SETUP.md` - This documentation

### Modified Files:
- `app/_layout.tsx` - Notification service integration
- `app.json` - Android permissions added

## Single Notification Message

### Welcome Notification:
```
Title: Welcome to mDojo! 💬
Body: Your employee feedback chatbot is ready. Share your thoughts and help us improve!
```

**Timing**: Randomly scheduled between 2-5 days after app installation

## Troubleshooting

### 1. Notification Not Coming
- Check app permissions in device settings
- Disable battery optimization
- Use NotificationTester to test

### 2. For Testing
- Press "Reset Install Date" button
- Restart the app
- Notification will be scheduled

### 3. In Development
- Use Expo development build
- Test on real device (notifications don't work in emulator)

## Production Deployment

### 1. APK Build
```bash
eas build -p android --profile production
```

### 2. App Store
- Enable push notifications in App Store Connect for iOS
- Verify permissions in Google Play Console for Android

## Customization

### To Change Message:
Edit the notification content in `services/NotificationService.js`:

```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Your custom title',
    body: 'Your custom message',
    data: { type: 'welcome-reminder', days: randomDays },
  },
  // ... rest of the code
});
```

### To Change Timing Range:
Modify the random days calculation:

```javascript
// For 1-3 days range
const randomDays = 1 + Math.floor(Math.random() * 3);

// For 3-7 days range  
const randomDays = 3 + Math.floor(Math.random() * 5);
```

## Benefits of Single Notification Approach

### 1. User Experience
- **No Spam**: Users won't be overwhelmed with multiple notifications
- **Respectful**: Shows consideration for user's time and attention
- **Effective**: Single, well-timed notification has higher engagement

### 2. Technical Benefits
- **Simple Logic**: Easier to maintain and debug
- **Less Resource Usage**: Fewer scheduled notifications
- **Cleaner Code**: Simplified notification management

### 3. Business Benefits
- **Higher Open Rates**: Single notification gets more attention
- **Better User Retention**: Users appreciate not being spammed
- **Professional Image**: Shows respect for user experience

## Integration with Existing Features

### Chat System Integration
The single notification integrates with the existing employee feedback chat system:
- Welcome notification can direct users to start a feedback conversation
- Notification timing doesn't conflict with chat interactions
- Encourages employees to share their thoughts and feedback

### Admin Panel Integration
- Notification analytics can be added to the admin panel
- Track notification delivery and open rates
- Monitor employee engagement with feedback system

## Best Practices

### 1. User Experience
- Keep the message valuable and relevant to employee feedback
- Use clear, action-oriented language
- Include emojis for visual appeal
- Encourage participation in feedback system

### 2. Testing
- Always test on real devices
- Test different timing scenarios
- Verify notification permissions

### 3. Analytics
- Track notification open rates
- Monitor employee engagement after notification
- A/B test different message formats
- Measure feedback participation rates 

## ✅ **Updated for Employee Feedback Chatbot App**

### **Key Changes Made:**

#### **1. Corrected Notification Message:**
```
Title: Welcome to mDojo! 💬
Body: Your employee feedback chatbot is ready. Share your thoughts and help us improve!
```

#### **2. Updated All References:**
- **Removed**: All tractor/farming references
- **Added**: Employee feedback and chatbot context
- **Emoji**: Changed from 🚜 (tractor) to 💬 (chat)

#### **3. Updated Documentation:**
- **Project Type**: Employee feedback chatbot app
- **Purpose**: Encouraging employees to share feedback
- **Integration**: Works with existing chat system for feedback collection

### **What the Notification Does:**

1. **Welcomes Employees**: Friendly introduction to mDojo
2. **Encourages Feedback**: Invites employees to share their thoughts
3. **Improves Engagement**: Helps increase participation in feedback system
4. **Simple & Clean**: One notification, no spam

### **Perfect for Your Use Case:**

✅ **Employee-Focused**: Encourages feedback participation  
✅ **Chatbot-Relevant**: Mentions the chatbot functionality  
✅ **Professional**: Appropriate for workplace environment  
✅ **Engaging**: Encourages employees to share thoughts  

### **Testing:**
- **Access**: Navigate to `/notification-test`
- **Test**: "Test Notification (5 sec)" for immediate testing
- **Reset**: "Reset Install Date" to test the full flow

Your notification system is now perfectly aligned with your **mDojo employee feedback chatbot app**! 💬✨ 