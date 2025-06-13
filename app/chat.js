import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CHAT_STATES = {
  EMPLOYEE_ID: 'EMPLOYEE_ID',
  MOOD_SELECTION: 'MOOD_SELECTION',
  FOLLOW_UP: 'FOLLOW_UP',
  FEEDBACK: 'FEEDBACK',
  THANK_YOU: 'THANK_YOU'
};

const MOODS = [
  { id: 'glad', label: 'Glad 😊!', emoji: '😊', color: '#E31937' },
  { id: 'sad', label: 'Sad 😢!', emoji: '😢', color: '#E31937' },
  { id: 'mad', label: 'Mad 😠!', emoji: '😠', color: '#E31937' }
];

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
  const scrollViewRef = useRef(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: "Welcome to mDojo! Please enter your Employee ID to continue.",
      isUser: false,
      time: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmployeeIdSubmit = () => {
    const trimmedId = employeeId.trim();
    if (!trimmedId) return;

    const userMessage = {
      id: Date.now(),
      text: `Employee ID: ${trimmedId}`,
      isUser: true,
      time: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setEmployeeId('');

    setTimeout(() => {
      showMoodSelection();
    }, 500);
  };

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

  const handleMoodSelect = (mood) => {
    const moodData = MOODS.find(m => m.id === mood);
    setSelectedMood(mood);
    
    const userMoodMessage = {
      id: Date.now(),
      text: moodData.label,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, userMoodMessage]);
    
    setTimeout(() => {
      showFollowUpQuestion(mood);
    }, 500);
  };

  const showFollowUpQuestion = (mood) => {
    const followUp = FOLLOW_UP_QUESTIONS[mood];
    if (!followUp) return;
    
    const followUpMessage = {
      id: Date.now() + 1,
      text: followUp.question,
      isUser: false,
      time: new Date(),
      isFollowUp: true
    };
    
    setMessages(prev => [...prev, followUpMessage]);
    setChatState(CHAT_STATES.FOLLOW_UP);
  };

  const handleOptionSelect = (option) => {
    const optionMessage = {
      id: Date.now(),
      text: option.text,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, optionMessage]);
    
    setTimeout(() => {
      showThankYou();
    }, 1000);
  };

  const showThankYou = () => {
    const thankYouMessage = {
      id: Date.now() + 1,
      text: "Thank you for your feedback! Your responses have been recorded. Have a great day! 😊",
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, thankYouMessage]);
    setChatState(CHAT_STATES.THANK_YOU);
  };

  const handleSend = () => {
    if (chatState === CHAT_STATES.EMPLOYEE_ID) {
      handleEmployeeIdSubmit();
    } else if (chatState === CHAT_STATES.FEEDBACK) {
      showThankYou();
    }
  };

  const isSendDisabled = () => {
    if (chatState === CHAT_STATES.MOOD_SELECTION || 
        chatState === CHAT_STATES.THANK_YOU ||
        chatState === CHAT_STATES.FOLLOW_UP) {
      return true;
    }
    
    if (chatState === CHAT_STATES.EMPLOYEE_ID) {
      return !employeeId || !employeeId.trim();
    }
    
    return !message || !message.trim();
  };

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

  const renderFollowUpOptions = () => {
    if (chatState !== CHAT_STATES.FOLLOW_UP || !selectedMood) return null;
    
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
              style={[
                styles.optionButton,
                { backgroundColor: '#E31937' }
              ]}
              onPress={() => handleOptionSelect(option)}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.background}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderText}>mDojo</Text>
            </View>
            
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={styles.messagesContainer}
              style={styles.messagesScrollView}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
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
          </ScrollView>

          {(chatState === CHAT_STATES.EMPLOYEE_ID || chatState === CHAT_STATES.FEEDBACK) && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  chatState === CHAT_STATES.EMPLOYEE_ID && styles.employeeIdInput
                ]}
                value={chatState === CHAT_STATES.EMPLOYEE_ID ? employeeId : message}
                onChangeText={(text) => {
                  if (chatState === CHAT_STATES.EMPLOYEE_ID) {
                    setEmployeeId(text.toUpperCase());
                  } else {
                    setMessage(text);
                  }
                }}
                placeholder={chatState === CHAT_STATES.EMPLOYEE_ID ? 
                  'Enter Employee ID (e.g., EMP001)' : 'Type your message...'}
                placeholderTextColor="#999"
                multiline
                onSubmitEditing={() => !isSendDisabled() && handleSend()}
                returnKeyType={chatState === CHAT_STATES.EMPLOYEE_ID ? 'next' : 'send'}
                blurOnSubmit={chatState !== CHAT_STATES.EMPLOYEE_ID}
                enablesReturnKeyAutomatically={true}
                keyboardType={chatState === CHAT_STATES.EMPLOYEE_ID ? 'default' : 'default'}
                editable={chatState !== CHAT_STATES.THANK_YOU}
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
        </View>
      </View>
    </SafeAreaView>
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E31937',
  },
  background: {
    flex: 1,
    backgroundColor: '#E31937',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatContainer: {
    width: '100%',
    maxWidth: 1000,
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  chatHeader: {
    backgroundColor: '#E31937',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesScrollView: {
    flex: 1,
    marginBottom: 0,
  },
  messagesContainer: {
    padding: 16,
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
    backgroundColor: '#f5f5f5',
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
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
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
    elevation: 2,
    shadowColor: '#000',
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
    marginHorizontal: -4,
  },
  moodCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedMoodCard: {
    transform: [{ scale: 1.08 }],
    elevation: 10,
    shadowRadius: 10,
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
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsScrollContent: {
    paddingHorizontal: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  optionEmoji: {
    fontSize: 20,
    color: '#fff',
  },
});

export default ChatScreen;