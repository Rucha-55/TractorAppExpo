import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  SafeAreaView,
  Animated,
  Alert
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

// Inline SVG for Mahindra logo (white text on red background)
const mahindraLogoSVG = `
  <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" fill="#E31937"/>
    <text x="60" y="26" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Mahindra</text>
  </svg>
`;

// Convert SVG to base64 for Image component
const mahindraLogo = { 
  uri: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(mahindraLogoSVG)))}` 
};

// Chat flow states
const CHAT_STATES = {
  EMPLOYEE_ID: 'EMPLOYEE_ID',
  MOOD_SELECTION: 'MOOD_SELECTION',
  FOLLOW_UP: 'FOLLOW_UP',
  FEEDBACK: 'FEEDBACK',
  THANK_YOU: 'THANK_YOU'
};

// Mood options
const MOODS = [
  { id: 'glad', label: '😊 Glad', color: '#4CAF50' },
  { id: 'neutral', label: '😐 Neutral', color: '#FFC107' },
  { id: 'sad', label: '😔 Sad', color: '#F44336' }
];

// Follow-up questions based on mood
const FOLLOW_UP_QUESTIONS = {
  glad: [
    "What's making you feel glad today?",
    "Can you share what went well?"
  ],
  neutral: [
    "What would make your day better?",
    "Is there anything specific on your mind?"
  ],
  sad: [
    "I'm sorry to hear that. What's bothering you?",
    "Would you like to share what happened?"
  ]
};

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATES.EMPLOYEE_ID);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [chatData, setChatData] = useState({
    employeeId: '',
    mood: '',
    responses: [],
    feedback: ''
  });
  
  const scrollViewRef = useRef();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: "Welcome to mDojo! Please enter your Employee ID to continue.",
      isUser: false,
      time: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle employee ID submission
  const handleEmployeeIdSubmit = async () => {
    console.log('handleEmployeeIdSubmit called with employeeId:', employeeId);
    
    const trimmedId = employeeId.trim();
    if (!trimmedId) {
      console.log('Empty employee ID, returning');
      Alert.alert('Required', 'Please enter your Employee ID');
      return;
    }

    // Validate employee ID format (example: EMP001)
    if (!/^EMP\d{3}$/i.test(trimmedId)) {
      console.log('Invalid employee ID format:', trimmedId);
      Alert.alert('Invalid Format', 'Please enter a valid Employee ID (e.g., EMP001)');
      return;
    }

    console.log('Employee ID is valid, proceeding...');

    try {
      // Show loading state
      const userMessage = {
        id: Date.now(),
        text: `Employee ID: ${trimmedId}`,
        isUser: true,
        time: new Date()
      };
      
      console.log('Adding user message:', userMessage);
      
      // Update messages with the user's input
      setMessages(prev => {
        console.log('Current messages before update:', prev);
        return [...prev, userMessage];
      });
      
      // Clear the input field
      setEmployeeId('');

      // Simulate verification
      setTimeout(() => {
        console.log('Setting chat data with employeeId:', trimmedId);
        setChatData(prev => {
          const newData = { 
            ...prev, 
            employeeId: trimmedId,
            timestamp: new Date().toISOString()
          };
          console.log('New chat data:', newData);
          return newData;
        });
        
        // Show mood selection after a short delay
        showMoodSelection();
      }, 500);
      
    } catch (error) {
      console.error('Error in handleEmployeeIdSubmit:', error);
      Alert.alert('Error', 'An error occurred while processing your request. Please try again.');
    }
  };

  // Show mood selection
  const showMoodSelection = () => {
    console.log('showMoodSelection called');
    const moodQuestion = {
      id: Date.now() + 1,
      text: "How are you feeling today?",
      isUser: false,
      time: new Date(),
      isMoodQuestion: true
    };
    
    console.log('Adding mood question:', moodQuestion);
    setMessages(prev => {
      console.log('Current messages before adding mood question:', prev);
      const newMessages = [...prev, moodQuestion];
      console.log('Messages after adding mood question:', newMessages);
      return newMessages;
    });
    
    console.log('Setting chat state to MOOD_SELECTION');
    setChatState(CHAT_STATES.MOOD_SELECTION);
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    
    // Add user's mood selection to chat
    const userMoodMessage = {
      id: Date.now(),
      text: `I'm feeling ${mood}`,
      isUser: true,
      time: new Date()
    };
    
    setMessages(prev => [...prev, userMoodMessage]);
    setChatData(prev => ({ ...prev, mood }));
    
    // Show follow-up question after a delay
    setTimeout(() => showFollowUpQuestion(mood), 800);
  };

  // Show follow-up question based on mood
  const showFollowUpQuestion = (mood) => {
    const questions = FOLLOW_UP_QUESTIONS[mood] || [
      "Is there anything else you'd like to share?"
    ];
    
    const question = {
      id: Date.now() + 1,
      text: questions[0], // Show first question
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, question]);
    setChatState(CHAT_STATES.FOLLOW_UP);
  };

  // Handle follow-up response
  const handleFollowUpResponse = () => {
    const responseText = message.trim();
    if (!responseText) return;
    
    // Add user's response
    const userResponse = {
      id: Date.now(),
      text: responseText,
      isUser: true,
      time: new Date()
    };
    
    setMessages(prev => [...prev, userResponse]);
    setMessage('');
    
    // Update chat data
    setChatData(prev => ({
      ...prev,
      responses: [...(prev.responses || []), responseText]
    }));
    
    // Move to feedback state
    setTimeout(() => showFeedbackRequest(), 800);
  };

  // Show feedback request
  const showFeedbackRequest = () => {
    const feedbackQuestion = {
      id: Date.now() + 1,
      text: "Thank you for sharing. Do you have any additional feedback or suggestions for us?",
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, feedbackQuestion]);
    setChatState(CHAT_STATES.FEEDBACK);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (message.trim()) {
      // Add feedback to chat data
      setChatData(prev => ({
        ...prev,
        feedback: message
      }));
      
      // Save chat data to Firestore
      saveChatData();
    }
    
    // Show thank you message
    showThankYou();
  };

  // Save chat data to Firestore
  const saveChatData = async () => {
    try {
      await addDoc(collection(db, 'chat_sessions'), {
        ...chatData,
        timestamp: serverTimestamp(),
        completed: true
      });
      console.log('Chat session saved successfully');
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  };

  // Show thank you message
  const showThankYou = () => {
    const thankYouMessage = {
      id: Date.now() + 1,
      text: "Thank you for your feedback! Your responses have been recorded. Have a great day! 😊",
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, thankYouMessage]);
    setChatState(CHAT_STATES.THANK_YOU);
    setMessage('');
    
    // Optionally navigate away after a delay
    setTimeout(() => {
      // navigation.goBack(); // Or navigate to another screen
    }, 3000);
  };

  // Handle send button press based on chat state
  const handleSend = () => {
    console.log('handleSend called with chatState:', chatState);
    console.log('employeeId:', employeeId);
    console.log('message:', message);
    
    // Prevent multiple rapid clicks
    if (isSendDisabled()) {
      console.log('Send button is disabled, ignoring press');
      return;
    }
    
    switch (chatState) {
      case CHAT_STATES.EMPLOYEE_ID:
        console.log('Calling handleEmployeeIdSubmit');
        handleEmployeeIdSubmit();
        break;
      case CHAT_STATES.FOLLOW_UP:
        console.log('Calling handleFollowUpResponse');
        handleFollowUpResponse();
        break;
      case CHAT_STATES.FEEDBACK:
        console.log('Calling handleFeedbackSubmit');
        handleFeedbackSubmit();
        break;
      default:
        console.log('No handler for chat state:', chatState);
        break;
    }
    
    // Clear input if not in employee ID state
    if (chatState !== CHAT_STATES.EMPLOYEE_ID) {
      setMessage('');
    } else {
      setEmployeeId('');
    }
  };

  // Get appropriate placeholder text based on chat state
  const getPlaceholderText = () => {
    switch (chatState) {
      case CHAT_STATES.EMPLOYEE_ID:
        return 'Enter Employee ID (e.g., EMP001)';
      case CHAT_STATES.FOLLOW_UP:
        return 'Type your response...';
      case CHAT_STATES.FEEDBACK:
        return 'Your feedback (optional)';
      default:
        return 'Type a message...';
    }
  };

  // Check if send button should be disabled
  const isSendDisabled = () => {
    console.log('isSendDisabled - chatState:', chatState);
    
    // Always disable for these states
    if (chatState === CHAT_STATES.MOOD_SELECTION || 
        chatState === CHAT_STATES.THANK_YOU) {
      console.log('Button disabled due to chat state');
      return true;
    }
    
    // For employee ID input
    if (chatState === CHAT_STATES.EMPLOYEE_ID) {
      const disabled = !employeeId || !employeeId.trim();
      console.log('EMPLOYEE_ID state - disabled:', disabled, 'employeeId:', `'${employeeId}'`);
      return disabled;
    }
    
    // For message input (follow-up and feedback states)
    const disabled = !message || !message.trim();
    console.log('MESSAGE state - disabled:', disabled, 'message:', `'${message}'`);
    return disabled;
  };

  // Render mood selection buttons
  const renderMoodSelection = () => {
    if (chatState !== CHAT_STATES.MOOD_SELECTION) return null;
    
    return (
      <View style={styles.moodContainer}>
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodButton,
              { backgroundColor: mood.color },
              selectedMood === mood.id && styles.selectedMoodButton
            ]}
            onPress={() => handleMoodSelect(mood.id)}
          >
            <Text style={styles.moodText}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={mahindraLogo}
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.chatTitleContainer}>
          <Text style={styles.chatTitle}>mDojo</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.map((msg) => (
            <Animated.View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.isUser ? styles.userBubble : styles.botBubble,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={msg.isUser ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
              <Text style={[
                styles.timeText,
                msg.isUser ? styles.userTimeText : {}
              ]}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Animated.View>
          ))}
          {renderMoodSelection()}
        </ScrollView>

        {/* Input Area - Only show for certain states */}
        {chatState !== CHAT_STATES.MOOD_SELECTION && chatState !== CHAT_STATES.THANK_YOU && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                chatState === CHAT_STATES.EMPLOYEE_ID && styles.employeeIdInput
              ]}
              value={chatState === CHAT_STATES.EMPLOYEE_ID ? employeeId : message}
              onChangeText={(text) => {
                if (chatState === CHAT_STATES.EMPLOYEE_ID) {
                  // Auto-uppercase and limit length for employee ID
                  const formattedText = text.toUpperCase();
                  if (formattedText.length <= 6) { // EMP + 3 digits
                    setEmployeeId(formattedText);
                  }
                } else {
                  setMessage(text);
                }
              }}
              placeholder={getPlaceholderText()}
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={() => !isSendDisabled() && handleSend()}
              returnKeyType="send"
              editable={chatState !== CHAT_STATES.THANK_YOU}
              keyboardType={chatState === CHAT_STATES.EMPLOYEE_ID ? 'default' : 'default'}
              autoCapitalize={chatState === CHAT_STATES.EMPLOYEE_ID ? 'characters' : 'sentences'}
              autoCorrect={false}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={!isSendDisabled()}
            />
            <TouchableOpacity 
              onPress={handleSend} 
              style={[
                styles.sendButton,
                isSendDisabled() && styles.sendButtonDisabled
              ]}
              disabled={isSendDisabled()}
            >
              <MaterialIcons 
                name="send" 
                size={22} 
                color="#fff" 
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 10 : 40,
    backgroundColor: '#E31937',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoContainer: {
    width: 100,
    height: 30,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  chatTitleContainer: {
    marginLeft: 15,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  messagesContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userBubble: {
    backgroundColor: '#E31937',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  botText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    textAlignVertical: 'center',
    includeFontPadding: false,
    color: '#333',
  },
  employeeIdInput: {
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E31937',
    elevation: 2, // Add shadow on Android
    shadowColor: '#000', // Add shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendIcon: {
    marginLeft: 2,
    marginTop: 1,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  // Mood selection styles
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  moodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedMoodButton: {
    transform: [{ scale: 1.05 }],
    elevation: 4,
  },
  moodText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatScreen;
