import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, increment, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../config/firebase';
import mdojoFullFlow from './mdojo_full_flow.json';

const { width, height } = Dimensions.get('window');

const CHAT_STATES = {
  MOOD_SELECTION: 'MOOD_SELECTION',
  FOLLOW_UP: 'FOLLOW_UP',
  SECONDARY_QUESTION: 'SECONDARY_QUESTION',
  THIRD_QUESTION: 'THIRD_QUESTION',
  FOURTH_QUESTION: 'FOURTH_QUESTION',
  ELABORATION: 'ELABORATION',
  FINAL_MESSAGE: 'FINAL_MESSAGE',
  THANK_YOU: 'THANK_YOU'
};

const MOODS = [
  { id: 'glad', label: 'Glad 😊!', emoji: '😊', color: '#E31937' },
  { id: 'sad', label: 'Sad 😢!', emoji: '😢', color: '#E31937' },
  { id: 'mad', label: 'Mad 😠!', emoji: '😠', color: '#E31937' }
];

export async function scheduleFeedbackReminder() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
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
  } else {
    // On web, do nothing (or log if you want)
    console.log('Notifications are not supported on web.');
  }
}

const ChatScreen = () => {
  const { employeeId: loggedInEmployeeId, employeeName } = useLocalSearchParams();
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATES.MOOD_SELECTION);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSecondaryOption, setSelectedSecondaryOption] = useState(null);
  const [currentFlow, setCurrentFlow] = useState(null); // Glad/Sad/Mad object from JSON
  const [currentStep, setCurrentStep] = useState(null); // e.g., 'step1', 'step2_task'
  const [elaboration, setElaboration] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showSecondaryOptions, setShowSecondaryOptions] = useState(false);
  const scrollViewRef = useRef(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const followUpScrollRef = useRef(null);

  const secondaryScrollRef = useRef(null);
  const [selectedThirdOption, setSelectedThirdOption] = useState(null);
  const [selectedFourthOption, setSelectedFourthOption] = useState(null);
  const [showThirdOptions, setShowThirdOptions] = useState(false);
  const [showFourthOptions, setShowFourthOptions] = useState(false);
  const [userName, setUserName] = useState('');

  const thirdScrollRef = useRef(null);
  const fourthScrollRef = useRef(null);
  const [editText, setEditText] = useState('');
  const [showEditText, setShowEditText] = useState(false);
  const [editTextPlaceholder, setEditTextPlaceholder] = useState('');
  const [pendingNextStep, setPendingNextStep] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [sadReasonKey, setSadReasonKey] = useState(null);
  const [madReasonKey, setMadReasonKey] = useState(null);
  const [conversationResponses, setConversationResponses] = useState([]);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const router = useRouter();

  const normalizeKey = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  useEffect(() => {
    const fetchUserNameAndGreet = async () => {
      let nameToShow = 'User';
      if (loggedInEmployeeId) {
        try {
          const userDoc = await getDoc(doc(db, 'employees', loggedInEmployeeId));
          if (userDoc.exists()) {
            nameToShow = userDoc.data().name || 'User';
          }
        } catch (error) {
          // fallback to 'User'
        }
      }
      setUserName(nameToShow);

      // Now set the welcome messages with the correct name
      const welcomeMessage1 = {
        id: 1,
        text: "Welcome to mDojo!",
        isUser: false,
        time: new Date()
      };
      const welcomeMessage2 = {
        id: 2,
        text: `Hi, ${nameToShow}!`,
        isUser: false,
        time: new Date()
      };
      setMessages([welcomeMessage1, welcomeMessage2]);
      setTimeout(() => {
        showMoodSelection();
      }, 800);
      setChatState(CHAT_STATES.MOOD_SELECTION);
    };

    fetchUserNameAndGreet();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!loggedInEmployeeId) return;
      const q = query(
        collection(db, 'chatResponses'),
        where('employeeId', '==', loggedInEmployeeId),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const history = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        history.push({
          id: data.id || doc.id,
          text: data.text,
          isUser: data.isUser,
          time: data.timestamp ? data.timestamp.toDate() : new Date()
        });
      });
      if (history.length > 0) {
        history.unshift(
          {
            id: 1,
            text: "Welcome to mDojo!",
            isUser: false,
            time: new Date()
          },
          {
            id: 2,
            text: `Hi, ${userName || 'User'}!`,
            isUser: false,
            time: new Date()
          }
        );
      }
      setMessages(history);
    };
    fetchChatHistory();
  }, [loggedInEmployeeId, userName]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, showOptions, showSecondaryOptions]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const saveEmployeeMood = async (id, mood) => {
    try {
      if (!mood) {
        console.warn("Missing employeeId or mood", { id, mood });
        return false;
      }
      
      console.log("Saving employee mood:", { employeeId: id, mood });
      
      // Save to chatResponses collection for dashboard
      await addDoc(collection(db, 'chatResponses'), {
        employeeId: id.trim(),
        mood: mood,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        // Include additional context if available
        ...(selectedOption && { primaryOption: selectedOption }),
        ...(selectedSecondaryOption && { secondaryOption: selectedSecondaryOption }),
        ...(selectedThirdOption && { thirdOption: selectedThirdOption }),
        ...(selectedFourthOption && { fourthOption: selectedFourthOption }),
        ...(elaboration && { elaboration: elaboration })
      });
      
      // Also save to employeeMoods for backward compatibility
      await addDoc(collection(db, 'employeeMoods'), {
        employeeId: id.trim(),
        mood: mood,
        timestamp: serverTimestamp()
      });
      
      console.log("Employee mood saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving employee mood: ", error);
      Alert.alert("Error", "Failed to save mood. Please try again.");
      return false;
    }
  };

  const updateMoodCount = async (mood) => {
    try {
      if (!mood) {
        console.warn("No mood provided for count update");
        return;
      }
      
      // Update daily mood count
      const dailyMoodRef = doc(db, 'moodCounts', 'daily');
      await setDoc(dailyMoodRef, {
        [mood]: increment(1),
        lastUpdated: serverTimestamp(),
        // Keep track of the last update time
        lastUpdatedFormatted: new Date().toISOString()
      }, { merge: true });
      
      // Also update the current counts for backward compatibility
      const moodCountRef = doc(db, 'moodCounts', 'currentCounts');
      await setDoc(moodCountRef, {
        [mood]: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      console.log("Mood count updated successfully for:", mood);
    } catch (error) {
      console.error("Error updating mood count: ", error);
      Alert.alert("Error", "Failed to update mood count.");
    }
  };
  
  // Function to save complete chat response (including all options and elaboration)
  const saveChatResponse = async () => {
    try {
      const responseData = {
        employeeId: loggedInEmployeeId,
        mood: selectedMood,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        ...(selectedOption && { primaryOption: selectedOption }),
        ...(selectedSecondaryOption && { secondaryOption: selectedSecondaryOption }),
        ...(selectedThirdOption && { thirdOption: selectedThirdOption }),
        ...(selectedFourthOption && { fourthOption: selectedFourthOption }),
        ...(elaboration && { elaboration: elaboration })
      };
      
      setConversationResponses(prev => [...prev, responseData]);
      console.log('Chat response saved successfully');
    } catch (error) {
      console.error("Error saving chat response: ", error);
      Alert.alert("Error", "Failed to save chat response. Please try again.");
    }
  };

// Add goToStep function
const goToStep = (stepKey) => {
  setCurrentStep(stepKey);
  const step = currentFlow[stepKey];
  if (step && step.question) {
    const botMsg = {
      id: Date.now(),
      text: step.question,
      isUser: false,
      time: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
    // saveChatMessage(loggedInEmployeeId, botMsg); // REMOVED
  }
};

const handleMoodSelect = (mood) => {
  setSelectedMood(mood);
  let flow = null;
  if (mood === 'glad') flow = mdojoFullFlow.Glad;
  else if (mood === 'sad') flow = mdojoFullFlow.Sad;
  else if (mood === 'mad') flow = mdojoFullFlow.Mad;

  setCurrentFlow(flow);
  setMessages(prev => [
    ...prev,
    { id: Date.now(), text: mood.charAt(0).toUpperCase() + mood.slice(1), isUser: true, time: new Date() }
  ]);
  // Use the local flow variable directly:
  goToStepWithFlow('step1', flow);
};

// New helper function:
const goToStepWithFlow = (stepKey, flowOverride) => {
  const flow = flowOverride || currentFlow;
  setCurrentStep(stepKey);
  const step = flow[stepKey];
  if (step && step.question) {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: step.question,
        isUser: false,
        time: new Date()
      }
    ]);
  }
};

  const handleElaborationSubmit = async () => {
    if (!elaboration.trim()) return;

    const elaborationMessage = {
      id: Date.now(),
      text: elaboration,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, elaborationMessage]);
    setElaboration('');
    
    await saveChatResponse();
    
    setTimeout(() => {
      showFinalMessages();
    }, 500);
  };

  const handleSend = () => {
    if (chatState === CHAT_STATES.ELABORATION) {
      handleElaborationSubmit();
    }
  };

  const isSendDisabled = () => {
     if (chatState === CHAT_STATES.ELABORATION) {
    return !elaboration || elaboration.trim().length < 5;
  }
    if (chatState === CHAT_STATES.MOOD_SELECTION || 
        chatState === CHAT_STATES.THANK_YOU ||
        chatState === CHAT_STATES.FOLLOW_UP ||
        chatState === CHAT_STATES.SECONDARY_QUESTION) {
      return true;
    }
    
    return !message || !message.trim();
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

  const showInitialQuestion = (mood) => {
    const flow = mood === 'glad' ? GLAD_FLOW : mood === 'sad' ? SAD_FLOW : MAD_FLOW;
    
    const firstMessage = {
      id: Date.now() + 1,
      text: flow.initialQuestion.messages[0],
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, firstMessage]);
    
    setTimeout(() => {
      const gifMessage = {
        id: Date.now() + 2,
        text: flow.initialQuestion.messages[1],
        isUser: false,
        time: new Date(),
        isGif: true
      };
      setMessages(prev => [...prev, gifMessage]);
      
      setTimeout(() => {
        const questionMessage = {
          id: Date.now() + 3,
          text: flow.initialQuestion.messages[2],
          isUser: false,
          time: new Date(),
          isFollowUp: true
        };
        setMessages(prev => [...prev, questionMessage]);
        setChatState(CHAT_STATES.FOLLOW_UP);
        setShowOptions(true);
      }, 1000);
    }, 1000);
  };

  const handleOptionSelect = (optionText, nextStepKey) => {
    // Track Sad step1 selection
    if (currentFlow && currentFlow === mdojoFullFlow.Sad && currentStep === 'step1') {
      setSadReasonKey(normalizeKey(optionText));
    }
    // Dynamic Sad step3 branching after step2
    if (currentFlow && currentFlow === mdojoFullFlow.Sad && currentStep === 'step2' && nextStepKey === 'step3_dynamic') {
      if (sadReasonKey) {
        goToStep('step3_' + sadReasonKey);
        return;
      }
    }
    // Track Mad step1 selection
    if (currentFlow && currentFlow === mdojoFullFlow.Mad && currentStep === 'step1') {
      setMadReasonKey(normalizeKey(optionText));
    }
    // Dynamic Mad step3 branching after step2
    if (currentFlow && currentFlow === mdojoFullFlow.Mad && currentStep === 'step2' && nextStepKey === 'step3_dynamic') {
      if (madReasonKey) {
        goToStep('step3_' + madReasonKey);
        return;
      }
    }
    // Default behavior
    const userMsg = {
      id: Date.now(),
      text: optionText,
      isUser: true,
      time: new Date()
    };
    setMessages(prev => {
      console.log('[DEBUG] Adding message:', userMsg);
      return [...prev, userMsg];
    });
    // saveChatMessage(loggedInEmployeeId, userMsg); // REMOVED
    const step = currentFlow[nextStepKey];
    if (step && step.end === true) {
      showFinalMessages();
      return;
    }
    if (step && step.question_edit) {
      setEditText(step.question_edit);
      setEditTextPlaceholder(step.question_edit);
      setShowEditText(true);
      setPendingNextStep(step.next);
      setCurrentStep(nextStepKey);
    } else if (step && step.messages) {
      setPendingMessages(step.messages);
      setCurrentStep(nextStepKey);
      showPendingMessages(step.messages, step.next);
    } else {
      goToStep(nextStepKey);
    }
  };

const handleSecondaryOptionSelect = (option) => {
  const optionMessage = {
    id: Date.now(),
    text: option.text,
    isUser: true,
    time: new Date()
  };

  setSelectedSecondaryOption(option.value);
  setMessages(prev => [...prev, optionMessage]);
  setShowSecondaryOptions(false);
  
  setTimeout(() => {
    const gifUrl = currentFlow.secondaryQuestion.gifs[option.value];
    if (gifUrl) {
      const gifMessage = {
        id: Date.now() + 1,
        text: gifUrl,
        isUser: false,
        time: new Date(),
        isGif: true
      };
      setMessages(prev => [...prev, gifMessage]);
    }
    
    setTimeout(() => {
      const thirdQuestion = {
        id: Date.now() + 2,
        text: currentFlow.thirdQuestion.question,
        isUser: false,
        time: new Date(),
        isFollowUp: true
      };
      setMessages(prev => [...prev, thirdQuestion]);
      setChatState(CHAT_STATES.THIRD_QUESTION);
      setShowThirdOptions(true);
    }, 1000);
  }, 500);
};

// Add new handler for third question
const handleThirdOptionSelect = (option) => {
  const optionMessage = {
    id: Date.now(),
    text: option.text,
    isUser: true,
    time: new Date()
  };

  setSelectedThirdOption(option.value);
  setMessages(prev => [...prev, optionMessage]);
  setShowThirdOptions(false);
  
  setTimeout(() => {
    setTimeout(() => {
      const fourthQuestion = {
        id: Date.now() + 1,
        text: currentFlow.fourthQuestion.question,
        isUser: false,
        time: new Date(),
        isFollowUp: true
      };
      setMessages(prev => [...prev, fourthQuestion]);
      setChatState(CHAT_STATES.FOURTH_QUESTION);
      setShowFourthOptions(true);
    }, 1000);
  }, 500);
};

// Add new handler for fourth question
const handleFourthOptionSelect = (option) => {
  const optionMessage = {
    id: Date.now(),
    text: option.text,
    isUser: true,
    time: new Date()
  };

  setSelectedFourthOption(option.value);
  setMessages(prev => [...prev, optionMessage]);
  setShowFourthOptions(false);
  
  setTimeout(() => {
    // If user selects 'No, I prefer to keep it private', skip elaboration and show final messages
    if (option.value === 'Keep private') {
      saveChatResponse(); // Save the response before showing final messages
      showFinalMessages();
      return;
    }
    const elaborationPrompt = {
      id: Date.now() + 1,
      text: "Please elaborate yourself .",
      isUser: false,
      time: new Date()
    };
    setMessages(prev => [...prev, elaborationPrompt]);
    setChatState(CHAT_STATES.ELABORATION);
  }, 1000);
};

  const showFinalMessages = () => {
    console.log('[DEBUG] Entered showFinalMessages'); // Debug log
    // Store conversation summary in Firestore
    const chatObject = {};
    messages
      .filter(msg => typeof msg.text === 'string' && msg.text !== undefined && msg.text !== null)
      .forEach((msg, idx) => {
        chatObject[idx] = {
          ...msg,
          text: typeof msg.text === 'string' ? msg.text : ''
        };
      });
    const summaryData = {
      employeeId: loggedInEmployeeId,
      mood: selectedMood,
      timestamp: new Date(),
      chat: chatObject
    };
    addDoc(collection(db, 'chatResponses'), summaryData)
      .then(() => {
        console.log('Conversation summary saved to Firestore');
        if (Platform.OS === 'web') {
          window.alert('Thank you!\nYour feedback has been submitted. We appreciate your time!');
          router.replace('/login');
        } else {
          Alert.alert(
            'Thank you!',
            'Your feedback has been submitted. We appreciate your time!',
            [
              { text: 'OK', onPress: () => router.replace('/login') }
            ]
          );
        }
      })
      .catch((error) => {
        console.error('Error saving conversation summary:', error);
        if (Platform.OS === 'web') {
          window.alert('Error saving feedback. Please try again.');
        } else {
          Alert.alert('Error', 'Error saving feedback. Please try again.');
        }
      });
  };

  const showPendingMessages = (messagesArr, nextStep) => {
    if (!messagesArr || messagesArr.length === 0) {
      if (nextStep) {
        if (nextStep === 'end') {
          showFinalMessages();
        } else {
          goToStep(nextStep);
        }
      }
      return;
    }
    console.log('[DEBUG] Entered showPendingMessages');
    messagesArr.forEach((msg, idx) => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + idx, text: msg, isUser: false, time: new Date() }
        ]);
        if (idx === messagesArr.length - 1 && nextStep) {
          setTimeout(() => {
            if (nextStep === 'end') {
              showFinalMessages();
            } else {
              goToStep(nextStep);
            }
          }, 1200);
        }
      }, idx * 1200);
    });
  };

  const handleEditTextSubmit = () => {
    if (!editText.trim()) return;
    const userMsg = {
      id: Date.now(),
      text: editText,
      isUser: true,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    // saveChatMessage(loggedInEmployeeId, userMsg); // REMOVED
    setShowEditText(false);
    setEditText('');
    if (pendingNextStep) {
      const step = currentFlow[pendingNextStep];
      if (step && step.messages) {
        showPendingMessages(step.messages, step.next);
      } else {
        goToStep(pendingNextStep);
      }
      setPendingNextStep(null);
    }
  };

  const renderMoodSelection = () => {
    if (chatState !== CHAT_STATES.MOOD_SELECTION || selectedMood) return null;
    
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
    if (!showOptions || chatState !== CHAT_STATES.FOLLOW_UP || !selectedMood || !currentFlow) return null;
    
    const scrollLeft = () => {
      followUpScrollRef.current?.scrollTo({ x: 0, animated: true });
    };
    
    const scrollRight = () => {
      followUpScrollRef.current?.scrollToEnd({ animated: true });
    };
    
    return (
      <View>
        <View style={styles.optionsContainer}>
          <ScrollView 
            ref={followUpScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScrollContent}
          >
            {currentFlow.initialQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: '#E31937' }
                ]}
                onPress={() => handleOptionSelect(option.text, option.nextStepKey)}
              >
                {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.scrollArrowsContainer}>
          <TouchableOpacity 
            style={styles.scrollArrowButton} 
            onPress={scrollLeft}
          >
            <MaterialIcons name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.scrollArrowButton} 
            onPress={scrollRight}
          >
            <MaterialIcons name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSecondaryOptions = () => {
    if (!showSecondaryOptions || chatState !== CHAT_STATES.SECONDARY_QUESTION || !selectedMood || !currentFlow) return null;
    
    const scrollLeft = () => {
      secondaryScrollRef.current?.scrollTo({ x: 0, animated: true });
    };
    
    const scrollRight = () => {
      secondaryScrollRef.current?.scrollToEnd({ animated: true });
    };
    
    return (
      <View>
        <View style={styles.optionsContainer}>
          <ScrollView 
            ref={secondaryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScrollContent}
          >
            {currentFlow.secondaryQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: '#E31937' }
                ]}
                onPress={() => handleSecondaryOptionSelect(option)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.scrollArrowsContainer}>
          <TouchableOpacity 
            style={styles.scrollArrowButton} 
            onPress={scrollLeft}
          >
            <MaterialIcons name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.scrollArrowButton} 
            onPress={scrollRight}
          >
            <MaterialIcons name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderThirdOptions = () => {
  if (!showThirdOptions || chatState !== CHAT_STATES.THIRD_QUESTION || !currentFlow?.thirdQuestion) return null;
  
  const scrollLeft = () => {
    thirdScrollRef.current?.scrollTo({ x: 0, animated: true });
  };
  
  const scrollRight = () => {
    thirdScrollRef.current?.scrollToEnd({ animated: true });
  };
  
  return (
    <View>
      <View style={styles.optionsContainer}>
        <ScrollView 
          ref={thirdScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsScrollContent}
        >
          {currentFlow.thirdQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleThirdOptionSelect(option)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.scrollArrowsContainer}>
        <TouchableOpacity 
          style={styles.scrollArrowButton} 
          onPress={scrollLeft}
        >
          <MaterialIcons name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.scrollArrowButton} 
          onPress={scrollRight}
        >
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const renderFourthOptions = () => {
  if (!showFourthOptions || chatState !== CHAT_STATES.FOURTH_QUESTION || !currentFlow?.fourthQuestion) return null;
  
  const scrollLeft = () => {
    fourthScrollRef.current?.scrollTo({ x: 0, animated: true });
  };
  
  const scrollRight = () => {
    fourthScrollRef.current?.scrollToEnd({ animated: true });
  };
  
  return (
    <View>
      <View style={styles.optionsContainer}>
        <ScrollView 
          ref={fourthScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsScrollContent}
        >
          {currentFlow.fourthQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleFourthOptionSelect(option)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.scrollArrowsContainer}>
        <TouchableOpacity 
          style={styles.scrollArrowButton} 
          onPress={scrollLeft}
        >
          <MaterialIcons name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.scrollArrowButton} 
          onPress={scrollRight}
        >
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const renderCurrentStep = () => {
  if (!currentFlow || !currentStep) return null;
  const step = currentFlow[currentStep];
  if (!step) return null;
  if (step.question_edit && showEditText) {
    return (
      <View style={[styles.optionsContainer, { flexDirection: 'row', alignItems: 'center' }]}> {/* Make row */}
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={editText}
          onChangeText={setEditText}
          placeholder={editTextPlaceholder}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !editText.trim() && styles.sendButtonDisabled]}
          onPress={handleEditTextSubmit}
          disabled={!editText.trim()}
        >
          <MaterialIcons name="send" size={22} color="#fff" style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    );
  }
  if (step.options) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {Object.entries(step.options).map(([optionText, nextStepKey]) => (
          <TouchableOpacity
            key={optionText}
            style={[styles.optionButton, { alignSelf: 'flex-start', marginRight: 12, marginBottom: 12, minWidth: undefined, width: undefined, maxWidth: '90%' }]}
            onPress={() => handleOptionSelect(optionText, nextStepKey)}
          >
            <Text style={styles.optionText}>{optionText}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
  return null;
};
    const renderInputField = () => {
      if (chatState === CHAT_STATES.ELABORATION) {
        return (
          <TextInput
            style={styles.input}
            value={elaboration}
            onChangeText={setElaboration}
            placeholder='Please elaborate on your choices...'
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={() => !isSendDisabled() && handleSend()}
            returnKeyType="send"
          />
        );
      }
      return null;
    };
  // ... (keep all your other existing functions like showMoodSelection, showInitialQuestion, 
  // handleOptionSelect, handleSecondaryOptionSelect, showFinalMessages, etc.)

  // ... (keep all your existing render functions like renderMoodSelection, 
  // renderFollowUpOptions, renderSecondaryOptions, renderInputField)

  return (
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
          >
          {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, {marginHorizontal: 4}]} />
            <View style={styles.typingDot} />
          </View>
        )}

            {messages
              .filter(msg => typeof msg.text === 'string' && msg.text.trim() !== '')
              .map((msg) => (
              <Animated.View 
                key={msg.id} 
                style={[
                  styles.messageBubble, 
                  msg.isUser ? styles.userBubble : styles.botBubble,
                  { opacity: fadeAnim }
                ]}
              >
                {msg.isGif ? (
                  <Image 
                    source={{ uri: msg.text }}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={msg.isUser ? styles.userText : styles.botText}>
                    {msg.text}
                  </Text>
                )}
                <Text style={[
                  styles.timeText,
                  msg.isUser ? styles.userTimeText : {}
                ]}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Animated.View>
            ))}
            {renderMoodSelection()}
            {renderCurrentStep()}
            {renderFollowUpOptions()}
            {renderSecondaryOptions()}
            {renderThirdOptions()}
            {renderFourthOptions()}
          </ScrollView>

          {(chatState === CHAT_STATES.ELABORATION) && (
            <View style={styles.inputContainer}>
              {renderInputField()}
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

          {/* End of conversation popup */}
          <Modal
            visible={showEndPopup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEndPopup(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 320 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#E31937' }}>Thank you!</Text>
                <Text style={{ fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' }}>
                  Your feedback has been submitted. We appreciate your time!
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEndPopup(false)}
                  style={{ backgroundColor: '#E31937', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 32 }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

const saveChatMessage = async (employeeId, messageObj) => {
  await addDoc(collection(db, 'chatResponses'), {
    employeeId,
    ...messageObj,
    timestamp: serverTimestamp(),
  });
};


// ... (keep all your existing styles)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FF5A5F', // More vibrant red
  },
  background: {
    flex: 1,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  chatContainer: {
    width: '100%',
    maxWidth: 1000,
    height: height * 0.92,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chatHeader: {
   
    backgroundColor: '#E31937',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatHeaderText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  messagesScrollView: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  userBubble: {
    backgroundColor: '#FF5A5F',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    textAlignVertical: 'center',
    includeFontPadding: false,
    color: '#333',
    fontFamily: 'System',
  },
  employeeIdInput: {
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendIcon: {
    marginLeft: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  moodSelectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  selectedMoodCard: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowRadius: 10,
    shadowOpacity: 0.15,
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  optionsScrollContent: {
    paddingHorizontal: 8,
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    color: '#FFF',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  optionEmoji: {
    fontSize: 22,
    color: '#FFF',
  },
  gifImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginVertical: 8,
  },
  typingIndicator: {
  flexDirection: 'row',
  alignSelf: 'flex-start',
  marginBottom: 12,
  marginLeft: 16,
},
typingDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#CCC',
},
mahendraContainer: {
  position: 'absolute',
  top: 40,
  left: 20,
  zIndex: 10,
},
mahendraText: {
  fontSize: 28,
  fontWeight: 'bold',
  color: 'rgb(255, 255, 255)',
  letterSpacing: 1,
  textTransform: 'uppercase',
},
mlogo: {
  position: 'absolute',
  top: 40,
  right: 20,
  zIndex: 10,
},
mahendra: {
  width: 120,
  height: 40,
},
scrollArrowLeft: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 30,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
  backgroundColor: 'rgba(227, 25, 55, 0.7)',
  borderTopLeftRadius: 16,
  borderBottomLeftRadius: 16,
},
scrollArrowRight: {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: 30,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
  backgroundColor: 'rgba(227, 25, 55, 0.7)',
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
},
scrollArrowsContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 8,
  marginHorizontal: 16,
  gap: 12,
},
scrollArrowButton: {
  backgroundColor: 'rgba(227, 25, 55, 0.8)',
  borderRadius: 20,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
});

export default ChatScreen;