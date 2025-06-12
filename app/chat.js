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
  StatusBar,
  FlatList,
  Alert,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Chat flow states
const CHAT_STATES = {
  EMPLOYEE_ID: 'EMPLOYEE_ID',
  MOOD_SELECTION: 'MOOD_SELECTION',
  FOLLOW_UP: 'FOLLOW_UP',
  FEEDBACK: 'FEEDBACK',
  THANK_YOU: 'THANK_YOU'
};

// Mood options with emojis
const MOODS = [
  { id: 'glad', label: 'Glad 😊!', emoji: '😊', color: '#E31937' },
  { id: 'sad', label: 'Sad 😢!', emoji: '😢', color: '#E31937' },
  { id: 'mad', label: 'Mad 😠!', emoji: '😠', color: '#E31937' }
];

// Follow-up questions and responses based on mood
const FOLLOW_UP_QUESTIONS = {
  glad: {
    question: "Hi, That's great to hear that you are glad! What's making you feel good today?",
    options: [
      { text: 'Sociable colleagues', emoji: '👥' },
      { text: 'Good Boss', emoji: '👔' },
      { text: 'Meaningful Work', emoji: '💼' },
      { text: 'Work Environment', emoji: '🏢' },
      { text: 'Work Culture', emoji: '🌱' },
      { text: 'Work Life Balance', emoji: '⚖️' },
      { text: 'Great Career', emoji: '📈' },
      { text: 'Workplace Opportunities', emoji: '🎯' }
    ]
  },
  sad: {
    question: "I'm sorry to hear that you're feeling sad. What's bothering you today?",
    options: [
      { text: 'Workload', emoji: '🏋️' },
      { text: 'Team Issues', emoji: '👥' },
      { text: 'Lack of Recognition', emoji: '🏆' },
      { text: 'Work-Life Balance', emoji: '⚖️' },
      { text: 'Career Growth', emoji: '🌱' },
      { text: 'Management', emoji: '👔' }
    ]
  },
  mad: {
    question: "I understand you're feeling frustrated. What's making you mad?",
    options: [
      { text: 'Unfair Treatment', emoji: '😠' },
      { text: 'Communication Issues', emoji: '💬' },
      { text: 'Lack of Support', emoji: '🤝' },
      { text: 'Work Pressure', emoji: '🏋️' },
      { text: 'Process Inefficiencies', emoji: '🔄' }
    ]
  }
};

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATES.EMPLOYEE_ID);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [chatData, setChatData] = useState({
    employeeId: '',
    mood: '',
    responses: [],
    feedback: '',
    selectedOptions: []
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
    const trimmedId = employeeId.trim();
    if (!trimmedId) {
      Alert.alert('Required', 'Please enter your Employee ID');
      return;
    }

    // Validate employee ID format (example: EMP001)
    if (!/^EMP\d{3}$/i.test(trimmedId)) {
      Alert.alert('Invalid Format', 'Please enter a valid Employee ID (e.g., EMP001)');
      return;
    }

    try {
      const userMessage = {
        id: Date.now(),
        text: `Employee ID: ${trimmedId}`,
        isUser: true,
        time: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setEmployeeId('');

      // Simulate verification
      setTimeout(() => {
        setChatData(prev => ({
          ...prev, 
          employeeId: trimmedId,
          timestamp: new Date().toISOString()
        }));
        
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
    const moodQuestion = {
      id: Date.now() + 1,
      text: "How are you feeling today?",
      isUser: false,
      time: new Date(),
      isMoodQuestion: true
    };
    
    setMessages(prev => [...prev, moodQuestion]);
    setChatState(CHAT_STATES.MOOD_SELECTION);
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    const moodData = MOODS.find(m => m.id === mood);
    setSelectedMood(mood);
    
    // Add user's mood selection to chat
    const userMoodMessage = {
      id: Date.now(),
      text: moodData.label,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, userMoodMessage]);
    
    // Show follow-up question after a short delay
    setTimeout(() => {
      showFollowUpQuestion(mood);
    }, 500);
  };

  // Show follow-up question based on mood
  const showFollowUpQuestion = (mood) => {
    const followUp = FOLLOW_UP_QUESTIONS[mood];
    if (!followUp) return;
    
    // Add mood response to chat data
    setChatData(prev => ({
      ...prev,
      mood: mood,
      responses: [...prev.responses, { question: 'How are you feeling today?', answer: mood }]
    }));
    
    // Add image message if exists
    if (followUp.image) {
      const imageMessage = {
        id: Date.now() + 2,
        image: followUp.image,
        isUser: false,
        time: new Date()
      };
      setMessages(prev => [...prev, imageMessage]);
    }
    
    // Add follow-up question
    const followUpMessage = {
      id: Date.now() + 1,
      text: followUp.question,
      isUser: false,
      time: new Date(),
      isFollowUp: true,
      options: followUp.options
    };
    
    setMessages(prev => [...prev, followUpMessage]);
    setShowOptions(true);
    setChatState(CHAT_STATES.FOLLOW_UP);
  };

  // Handle option selection from follow-up
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Add selected option to chat
    const optionMessage = {
      id: Date.now(),
      text: option.text,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, optionMessage]);
    
    // Add option to chat data
    setChatData(prev => ({
      ...prev,
      responses: [...prev.responses, { 
        question: FOLLOW_UP_QUESTIONS[selectedMood].question,
        answer: option.text
      }],
      selectedOptions: [...prev.selectedOptions, option]
    }));
    
    // Show response image if exists
    if (option.image) {
      setTimeout(() => {
        const responseImage = {
          id: Date.now() + 1,
          image: option.image,
          isUser: false,
          time: new Date()
        };
        setMessages(prev => [...prev, responseImage]);
      }, 500);
    }
    
    setShowOptions(false);
    
    // Show feedback form after a delay
    setTimeout(() => {
      showFeedbackForm();
    }, 1000);
  };
  
  // Show feedback form
  const showFeedbackForm = () => {
    const feedbackMessage = {
      id: Date.now(),
      text: "How was your experience with mDojo today?",
      isUser: false,
      time: new Date(),
      isFeedback: true
    };
    
    setMessages(prev => [...prev, feedbackMessage]);
    setChatState(CHAT_STATES.FEEDBACK);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (feedback) => {
    if (feedback && feedback.trim()) {
      // Add feedback to chat data
      setChatData(prev => ({
        ...prev,
        feedback: feedback.trim()
      }));
    
    // Add thank you message
    const thankYouMessage = {
      id: Date.now(),
      text: "Thank you for your feedback! We appreciate your time.",
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, thankYouMessage]);
    setChatState(CHAT_STATES.THANK_YOU);
    
    // Save chat data to Firestore
    saveChatData();
  } else {
    // If no feedback provided, just show thank you
    showThankYou();
  }
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

  // Render mood selection buttons with enhanced UI
  const renderMoodSelection = () => {
    if (chatState !== CHAT_STATES.MOOD_SELECTION) return null;
    
    return (
      <View style={styles.moodSelectionContainer}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodCard,
                selectedMood === mood.id && styles.selectedMoodCard,
                { borderColor: mood.color }
              ]}
              onPress={() => handleMoodSelect(mood.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
              {selectedMood === mood.id && (
                <View style={[styles.selectionIndicator, { backgroundColor: mood.color }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

// Render follow-up options
const renderFollowUpOptions = () => {
  if (chatState !== CHAT_STATES.FOLLOW_UP || !showOptions) return null;
  
  return (
    <View style={styles.optionsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsScrollContent}
      >
        {FOLLOW_UP_QUESTIONS[selectedMood]?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleOptionSelect(option)}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Render feedback form
const renderFeedbackForm = () => {
  if (chatState !== CHAT_STATES.FEEDBACK) return null;
  
  return (
    <View style={styles.feedbackContainer}>
      <Text style={styles.feedbackQuestion}>How was your experience with mDojo today?</Text>
      <View style={styles.emojiContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            onPress={() => handleFeedbackSubmit(rating)}
            style={styles.emojiButton}
          >
            <Text style={styles.emoji}>
              {rating <= 3 ? '😞' : rating === 4 ? '😊' : '😍'}
            </Text>
            <Text style={styles.emojiLabel}>
              {rating <= 2 ? 'Poor' : rating === 3 ? 'Okay' : rating === 4 ? 'Good' : 'Great!'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

return (
  <SafeAreaView style={styles.safeArea}>
    {/* Header */}
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Mahindra</Text>
        </View>
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
          {renderFollowUpOptions()}
          {renderFeedbackForm()}
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
  logoPlaceholder: {
    width: 100,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#E31937',
    fontWeight: 'bold',
    fontSize: 16,
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
  moodSelectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedMoodCard: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowRadius: 8,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
});

export default ChatScreen;
