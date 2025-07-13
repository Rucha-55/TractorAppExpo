import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../config/firebase';

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

const GLAD_FLOW = {
  initialQuestion: {
    messages: [
      "Hi, That's great to hear that you are glad! Ride that wave as long as you can...Let's find what made you happy..😊",
      "https://media1.tenor.com/images/4f58221267ae80aae8458a4f6218da7e/tenor.gif?itemid=3555006",
      "What's making you feel good?"
    ],
    options: [
      { text: 'Sociable colleagues', emoji: '👥', value: 'Sociable colleagues' },
      { text: 'Good Boss', emoji: '👔', value: 'Good Boss' },
      { text: 'Meaningful Work', emoji: '💼', value: 'Meaningful Work' },
      { text: 'Work Environment', emoji: '🏢', value: 'Work Environment' },
      { text: 'Work Culture', emoji: '🌱', value: 'Work Culture' },
      { text: 'Work Life Balance', emoji: '⚖️', value: 'Work Life Balance' },
      
      { text: 'Workplace Opportunities', emoji: '🎯', value: 'Workplace Opportunities' }
    ],
     gifs: {
      'Sociable colleagues': 'https://media.giphy.com/media/3o85xpO8Od5wPPVUYg/giphy.gif',
      'Good Boss': 'https://pa1.narvii.com/5827/f74b44ae651bfe3cad6cbf2d658490c336af6a59_hq.gif',
      'Meaningful Work': 'https://www.jlwranglerforums.com/forum/attachments/ad1977cb-458f-426f-a703-c360f2664e56-gif.14655/',
      'Work Environment': 'https://i.pinimg.com/originals/20/e6/a4/20e6a4f470b3a19b80694b13c099d854.gif',
      'Work Culture': 'https://cdn.dribbble.com/users/759099/screenshots/4322310/comp_2_4.gif',
      'Work Life Balance': 'https://cdn.dribbble.com/users/1200451/screenshots/6631779/designer_life-2.gif',
      'Great Career': 'https://media.tenor.com/images/4c6dd7fae4c38a046fc7a28a69f210b2/tenor.gif',
      'Workplace Opportunities': 'https://media.giphy.com/media/mXnO9IiWWarkI/giphy.gif'
    }
  },
  secondaryQuestion: {
    question: "What precisely lead to this positive experience? Please describe your choice.",
    options: [
      { text: 'Constructive Feedback', value: 'Constructive Feedback' },
      { text: 'Appreciation', value: 'Appreciation' },
      { text: 'Good food', value: 'Good food' },
      { text: 'Experience', value: 'Experience' },
      
      { text: 'Opportunities', value: 'Opportunities' }
    ],
    gifs: {
      'Constructive Feedback': 'https://media1.tenor.com/images/2fc2d99986e19d40fc06c740196f0809/tenor.gif',
      'Appreciation': 'https://media1.tenor.com/images/2fc2d99986e19d40fc06c740196f0809/tenor.gif',
      'Good food': 'https://66.media.tumblr.com/7919df1cee2938c14501758f1cc22d1f/tumblr_o1pnpm8BL61tq4of6o1_500.gif',
      'Experience': 'https://media.tenor.com/images/07fa8b8675cdb40bf78ef28d766e2a9b/tenor.gif',
      'Fulfilling target': 'https://media1.tenor.com/images/018b82b7b47eb994dcb1c77aa0d49357/tenor.gif',
      'Opportunities': 'https://media1.tenor.com/images/018b82b7b47eb994dcb1c77aa0d49357/tenor.gif'
    }
  },
   thirdQuestion: {
    question: "How does this positive experience impact your work?",
    options: [
      { text: 'Makes me more productive', value: 'More productive' },
      { text: 'Improves team collaboration', value: 'Better collaboration' },
      { text: 'Boosts my creativity', value: 'Boosts creativity' },
      { text: 'Increases my job satisfaction', value: 'Job satisfaction' },
      { text: 'Motivates me to take on challenges', value: 'More motivated' }
    ]
  },
  
  fourthQuestion: {
    question: "Would you like to share this positive experience with others?",
    options: [
      { text: 'Yes', value: 'Yes' },
      { text: 'No, I prefer to keep it private', value: 'Keep private' },
      
    ]
  },
  finalMessages: [
    "It was a pleasure talking to you. Glad to hear such positive work experience. Many more to come along😊!!",
    "Talk to you next time.",
    "Thank you have a nice day. 😊"
  ]
};

const SAD_FLOW = {
  initialQuestion: {
    messages: [
      "Hi, it looks like you are having a rough day..😔",
      "https://media1.tenor.com/images/3e35e47384653347a72b0626ed90cfe6/tenor.gif?itemid=9816214",
      "Which of the following best describes the problem you are facing?"
    ],
    options: [
      { text: 'Unsupportive Manager', value: 'Unsupportive Manager' },
      { text: 'Work Culture', value: 'Work Culture' },
      { text: 'Work Policies', value: 'Work Policies' },
      { text: 'Colleagues', value: 'Colleagues' },
      { text: 'Unclear role', value: 'Unclear role' },
      { text: 'Infrastructure', value: 'Infrastructure' },
      { text: 'Work Life balance', value: 'Work Life balance' }
    ],
    gifs: {
      'Unsupportive Manager': 'https://64.media.tumblr.com/506a8671740f5704db5cd34f6c089bac/tumblr_n73q3tYGOJ1smcbm7o1_500.gif',
      'Work Culture': 'https://i.pinimg.com/originals/fe/16/95/fe169512003c32ca0deaf8d33d7d6d83.gif',
      'Work Policies': 'https://media.giphy.com/media/xUPJUKCtjmSxaCIfnO/giphy.gif',
      'Colleagues': 'https://media1.tenor.com/images/a90c3d2016c34c7b1b9680be689e38a2/tenor.gif?itemid=3390650',
      'Unclear role': 'https://media.tenor.com/images/a9cb2c1f5dfff33c20c1156d8c8e84f7/tenor.gif',
      'Infrastructure': 'https://kmtgroup.co.za/wp-content/uploads/2019/08/infra-1.gif',
      'Work Life balance': 'https://cdn.dribbble.com/users/953331/screenshots/6511780/worklifebalance_dribbble.gif'
    }
  },
  secondaryQuestion: {
    question: "What specifically about that is bothering you? ",
    options: [
      { text: 'Clarity', value: 'Clarity' },
      { text: 'Work station', value: 'Work station' },
      { text: 'Had an argument with someone', value: 'Had an argument with someone' },
      { text: 'Wasn’t able to achieve something', value: 'Wasn’t able to achieve something' },
      { text: 'feeling Unheard', value: 'feeling Unheard' },
      { text: 'Ideas undervalued', value: 'Ideas undervalued' },
      { text: 'less opportunities', value: 'less opportunities' },
      { text: 'unachievable targets', value: 'unachievable targets' },
      { text: 'Communication gap', value: 'Communication gap' }
    ],
    gifs: {
      'Clarity': 'https://i.pinimg.com/originals/92/4b/0e/924b0ec02c6521302cb630f476de21d0.gif',
      'Work station': 'https://media1.tenor.com/images/12932a3301c8355802d458249fd2c6cb/tenor.gif?itemid=11383230',
      'Had an argument with someone': 'https://media1.tenor.com/images/b68dd33c82af7c133b0b22629e00cdb9/tenor.gif?itemid=14891189',
      'Wasn’t able to achieve something': 'https://media0.giphy.com/media/3HuJrvIm6jfdkeqPBy/giphy.gif',
      'feeling Unheard': 'https://media.tenor.com/images/960f4694bdb04d2c709e19673d93a4f0/tenor.gif',
      'Ideas undervalued': 'https://media.tenor.com/images/59a598e84ce877eb5d0fd287bc0e6570/tenor.gif',
      'less opportunities': 'https://media.tenor.com/images/59247714f3b114960746cd12e70aa156/tenor.gif',
      'unachievable targets': 'https://media.giphy.com/media/3owzWl78kny9s2GOvC/giphy.gif',
      'Communication gap': 'https://media.giphy.com/media/TLJOmAuCvcGGh0xb3c/giphy.gif'
    }
  },
  thirdQuestion: {
    question: "How long have you been feeling this way?",
    options: [
      { text: 'Just today', value: 'One day' },
      { text: 'A few days', value: 'Few days' },
      { text: 'About a week', value: 'One week' },
      { text: 'Several weeks', value: 'Several weeks' },
      { text: 'Months or longer', value: 'Months+' }
    ]
  },
  
  fourthQuestion: {
    question: "What would help improve this situation?",
    options: [
      { text: 'More support from management', value: 'More support' },
      { text: 'Clearer communication', value: 'Better communication' },
    
      { text: 'More recognition', value: 'More recognition' },
      { text: 'Changes in work processes', value: 'Process changes' }
    ]
  },
  finalMessages: [
    " We understand why you might be feeling this way.",
    "I will forward your input to my creators and they will get back to you soon.",
    "Here are some suggestions that may make you feel relaxed: ",
    "Listening to Music 🎧,Breathing exercises, Chair Yoga, Take a tea/coffee break, talk to a friend/ loved one ",
    "It was nice talking to you! mDojo is signing Off now.😊"
  ]
};

const MAD_FLOW = {
  initialQuestion: {
    messages: [
      "Hi, I see that you are mad 😠",
      "https://media.tenor.com/images/204371c3eb3e3cf8f24b954965601c48/tenor.gif",
      "Can you describe what caused you to feel this way?"
    ],
    options: [
      { text: 'Boss', value: 'Boss' },
      { text: 'colleague', value: 'colleague' },
      { text: 'work environment', value: 'work environment' },
      { text: 'Work policies', value: 'Work policies' },
      { text: 'Role', value: 'Role' },
      { text: 'Infrastructure', value: 'Infrastructure' },
      { text: 'Work life balance', value: 'Work life balance' }
    ],
    gifs: {
      'Boss': 'https://media1.tenor.com/images/4695160bad4b1dba0a866a2f7ff2cd9a/tenor.gif?itemid=18007423',
      'colleague': 'https://media3.giphy.com/media/3o6fJdlKejPY66AqHK/giphy.gif',
      'work environment': 'https://media3.giphy.com/media/3ofT5PzgI9FSn8vPaw/giphy.gif',
      'Work policies': 'https://media.giphy.com/media/xUPJUKCtjmSxaCIfnO/giphy.gif',
      'Role': 'https://media1.tenor.com/images/c75952b989d9e9f792173a67bb5f81a2/tenor.gif?itemid=14850605',
      'Infrastructure': 'https://media1.tenor.com/images/00c5e6a4740b604bcbabede92b1cdd6c/tenor.gif?itemid=12615097',
      'Work life balance': 'https://cdn.dribbble.com/users/953331/screenshots/6511780/worklifebalance_dribbble.gif'
    }
  },
  secondaryQuestion: {
    question: "What specifically about that is bothering you? ",
    options: [
      { text: 'Deadlines', value: 'Deadlines' },
      { text: 'Work pressure', value: 'Work pressure' },
      { text: 'personal issues at work', value: 'personal issues at work' },
      { text: 'hygiene', value: 'hygiene' },
      { text: 'communication gap', value: 'communication gap' },
      { text: 'feeling unheard', value: 'feeling unheard' },
      { text: 'unsolved complaints', value: 'unsolved complaints' }
    ],
    gifs: {
      'Deadlines': 'https://media.giphy.com/media/3owzWl78kny9s2GOvC/giphy.gif',
      'Work pressure': 'https://i.gifer.com/2A83.gif',
      'personal issues at work': 'https://media.giphy.com/media/U16OUT29Z6AbNqnqkn/giphy.gif',
      'hygiene': 'https://66.media.tumblr.com/eb9048d0bf3fcabd61f73d17ba356ff7/tumblr_n9mzlc2Owu1ql5yr7o1_500.gif',
      'communication gap': 'https://media.giphy.com/media/TLJOmAuCvcGGh0xb3c/giphy.gif',
      'feeling unheard': 'https://media.tenor.com/images/960f4694bdb04d2c709e19673d93a4f0/tenor.gif',
      'unsolved complaints': 'https://media1.tenor.com/images/4dc0d395fe7bf0d7bb313a60ad8dd8dd/tenor.gif'
    }
  },
  thirdQuestion: {
    question: "How intense is this feeling?",
    options: [
      { text: 'annoyed', value: 'Mild' },
      { text: 'Frustrated', value: 'Frustrated' },
      { text: 'Angry', value: 'Angry' },
      { text: 'Very angry', value: 'Very angry' },
      { text: 'Extremely upset', value: 'Extremely upset' }
    ]
  },
  
  fourthQuestion: {
    question: "Have you tried resolving this issue from your end? ",
    options: [
      { text: 'Yes, talked to the person involved', value: 'Talked directly' },

      { text: 'No, Confused about plan of action.', value: 'Confused' },
      { text: 'No, not sure how to address it', value: 'Unsure' },
      { text: 'No, afraid of consequences', value: 'Fear' }
    ]
  },
  finalMessages: [
    
    "We understand why you might be feeling this way.",
    "I will forward your input to my creators and they will get back to you soon.",
    "Here are some suggestions that may make you feel relaxed: ",
    "Listening to Music 🎧, , Breathing exercises, Chair Yoga, Take a tea/coffee break, talk to a friend/ loved one",
    "It was nice chatting with you, mDOJO is signing off now."
  ]
};

const ChatScreen = () => {
  const { employeeId: loggedInEmployeeId, employeeName } = useLocalSearchParams();
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATES.MOOD_SELECTION);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSecondaryOption, setSelectedSecondaryOption] = useState(null);
  const [currentFlow, setCurrentFlow] = useState(null);
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

  useEffect(() => {
    const fetchUserName = async () => {
      if (!loggedInEmployeeId) return;
      try {
        const userDoc = await getDoc(doc(db, 'employees', loggedInEmployeeId));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        } else {
          setUserName('User');
        }
      } catch (error) {
        setUserName('User');
      }
    };

    fetchUserName();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    // Show two welcome messages: one general, one personalized
    const welcomeMessage1 = {
      id: 1,
      text: "Welcome to mDojo!",
      isUser: false,
      time: new Date()
    };
    const userNameToShow = employeeName || userName || 'User';
    const welcomeMessage2 = {
      id: 2,
      text: `Hi, ${userNameToShow}!`,
      isUser: false,
      time: new Date()
    };
    setMessages([welcomeMessage1, welcomeMessage2]);
    setTimeout(() => {
      showMoodSelection();
    }, 800);
    setChatState(CHAT_STATES.MOOD_SELECTION);
  }, []);

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
      
      await addDoc(collection(db, 'chatResponses'), responseData);
      console.log('Chat response saved successfully');
    } catch (error) {
      console.error("Error saving chat response: ", error);
      Alert.alert("Error", "Failed to save chat response. Please try again.");
    }
  };

const handleMoodSelect = async (mood) => {
    const moodData = MOODS.find(m => m.id === mood);
    setSelectedMood(mood);
    
    const userMoodMessage = {
      id: Date.now(),
      text: moodData.label,
      isUser: true,
      time: new Date()
    };

    setMessages(prev => [...prev, userMoodMessage]);
    
    try {
      await saveEmployeeMood(loggedInEmployeeId, mood);
      await updateMoodCount(mood);
      
      const flow = mood === 'glad' ? GLAD_FLOW : 
                   mood === 'sad' ? SAD_FLOW : MAD_FLOW;
      setCurrentFlow(flow);
      
      showInitialQuestion(mood);
    } catch (error) {
      console.error("Error in mood selection flow:", error);
      Alert.alert("Error", "There was a problem processing your selection.");
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

  const handleOptionSelect = (option) => {
    const optionMessage = {
      id: Date.now(),
      text: option.text,
      isUser: true,
      time: new Date()
    };

    setSelectedOption(option.value);
    setMessages(prev => [...prev, optionMessage]);
    setShowOptions(false);
    
    setTimeout(() => {
      const gifUrl = currentFlow.initialQuestion.gifs[option.value];
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
        const secondaryQuestion = {
          id: Date.now() + 2,
          text: currentFlow.secondaryQuestion.question,
          isUser: false,
          time: new Date(),
          isFollowUp: true
        };
        setMessages(prev => [...prev, secondaryQuestion]);
        setChatState(CHAT_STATES.SECONDARY_QUESTION);
        setShowSecondaryOptions(true);
      }, 1000);
    }, 500);
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
    const finalMessages = currentFlow.finalMessages;
    
    finalMessages.forEach((msg, index) => {
      setTimeout(() => {
        const finalMessage = {
          id: Date.now() + index,
          text: msg,
          isUser: false,
          time: new Date()
        };
        setMessages(prev => [...prev, finalMessage]);
        
        if (index === finalMessages.length - 1) {
          setChatState(CHAT_STATES.THANK_YOU);
        }
      }, index * 1000);
    });
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
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.scrollArrowLeft} 
          onPress={scrollLeft}
        >
          <MaterialIcons name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
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
              onPress={() => handleOptionSelect(option)}
            >
              {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.scrollArrowRight} 
          onPress={scrollRight}
        >
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
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
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.scrollArrowLeft} 
          onPress={scrollLeft}
        >
          <MaterialIcons name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
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
        
        <TouchableOpacity 
          style={styles.scrollArrowRight} 
          onPress={scrollRight}
        >
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };
  const renderThirdOptions = () => {
  if (!showThirdOptions || chatState !== CHAT_STATES.THIRD_QUESTION || !currentFlow?.thirdQuestion) return null;
  
  return (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={styles.scrollArrowLeft} 
        onPress={() => thirdScrollRef.current?.scrollTo({ x: 0, animated: true })}
      >
        <MaterialIcons name="chevron-left" size={24} color="#FFF" />
      </TouchableOpacity>
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
      <TouchableOpacity 
        style={styles.scrollArrowRight} 
        onPress={() => thirdScrollRef.current?.scrollToEnd({ animated: true })}
      >
        <MaterialIcons name="chevron-right" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const renderFourthOptions = () => {
  if (!showFourthOptions || chatState !== CHAT_STATES.FOURTH_QUESTION || !currentFlow?.fourthQuestion) return null;
  
  return (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={styles.scrollArrowLeft} 
        onPress={() => fourthScrollRef.current?.scrollTo({ x: 0, animated: true })}
      >
        <MaterialIcons name="chevron-left" size={24} color="#FFF" />
      </TouchableOpacity>
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
      <TouchableOpacity 
        style={styles.scrollArrowRight} 
        onPress={() => fourthScrollRef.current?.scrollToEnd({ animated: true })}
      >
        <MaterialIcons name="chevron-right" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
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

            {messages.map((msg) => (
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
        </View>
      </View>
    </SafeAreaView>
  );
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
});

export default ChatScreen;