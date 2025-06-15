// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Animated,
//   Dimensions,
//   Image,
//   Alert
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { collection, addDoc, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
// import { db } from '../config/firebase';

// const { width, height } = Dimensions.get('window');

// const CHAT_STATES = {
//   EMPLOYEE_ID: 'EMPLOYEE_ID',
//   MOOD_SELECTION: 'MOOD_SELECTION',
//   FOLLOW_UP: 'FOLLOW_UP',
//   SECONDARY_QUESTION: 'SECONDARY_QUESTION',
//   ELABORATION: 'ELABORATION',
//   FINAL_MESSAGE: 'FINAL_MESSAGE',
//   THANK_YOU: 'THANK_YOU'
// };

// const MOODS = [
//   { id: 'glad', label: 'Glad 😊!', emoji: '😊', color: '#E31937' },
//   { id: 'sad', label: 'Sad 😢!', emoji: '😢', color: '#E31937' },
//   { id: 'mad', label: 'Mad 😠!', emoji: '😠', color: '#E31937' }
// ];

// // ... (keep all your existing GLAD_FLOW, SAD_FLOW, MAD_FLOW constants as they are)
// const GLAD_FLOW = {
//   initialQuestion: {
//     messages: [
//       "Hi, That's great to hear that you are glad! Ride that wave as long as you can...Let's find what made you happy..😊",
//       "https://media1.tenor.com/images/4f58221267ae80aae8458a4f6218da7e/tenor.gif?itemid=3555006",
//       "What's making you feel good?"
//     ],
//     options: [
//       { text: 'Sociable colleagues', emoji: '👥', value: 'Sociable colleagues' },
//       { text: 'Good Boss', emoji: '👔', value: 'Good Boss' },
//       { text: 'Meaningful Work', emoji: '💼', value: 'Meaningful Work' },
//       { text: 'Work Environment', emoji: '🏢', value: 'Work Environment' },
//       { text: 'Work Culture', emoji: '🌱', value: 'Work Culture' },
//       { text: 'Work Life Balance', emoji: '⚖️', value: 'Work Life Balance' },
//       { text: 'Great Career', emoji: '📈', value: 'Great Career' },
//       { text: 'Workplace Opportunities', emoji: '🎯', value: 'Workplace Opportunities' }
//     ],
//      gifs: {
//       'Sociable colleagues': 'https://media.giphy.com/media/3o85xpO8Od5wPPVUYg/giphy.gif',
//       'Good Boss': 'https://pa1.narvii.com/5827/f74b44ae651bfe3cad6cbf2d658490c336af6a59_hq.gif',
//       'Meaningful Work': 'https://www.jlwranglerforums.com/forum/attachments/ad1977cb-458f-426f-a703-c360f2664e56-gif.14655/',
//       'Work Environment': 'https://i.pinimg.com/originals/20/e6/a4/20e6a4f470b3a19b80694b13c099d854.gif',
//       'Work Culture': 'https://cdn.dribbble.com/users/759099/screenshots/4322310/comp_2_4.gif',
//       'Work Life Balance': 'https://cdn.dribbble.com/users/1200451/screenshots/6631779/designer_life-2.gif',
//       'Great Career': 'https://media.tenor.com/images/4c6dd7fae4c38a046fc7a28a69f210b2/tenor.gif',
//       'Workplace Opportunities': 'https://media.giphy.com/media/mXnO9IiWWarkI/giphy.gif'
//     }
//   },
//   secondaryQuestion: {
//     question: "Did you get something that you were willing to have? Please describe your choice.",
//     options: [
//       { text: 'Constructive Feedback', value: 'Constructive Feedback' },
//       { text: 'Appreciation', value: 'Appreciation' },
//       { text: 'Good food', value: 'Good food' },
//       { text: 'Experience', value: 'Experience' },
//       { text: 'Fulfilling target', value: 'Fulfilling target' },
//       { text: 'Opportunities', value: 'Opportunities' }
//     ],
//     gifs: {
//       'Constructive Feedback': 'https://media1.tenor.com/images/2fc2d99986e19d40fc06c740196f0809/tenor.gif',
//       'Appreciation': 'https://media1.tenor.com/images/2fc2d99986e19d40fc06c740196f0809/tenor.gif',
//       'Good food': 'https://66.media.tumblr.com/7919df1cee2938c14501758f1cc22d1f/tumblr_o1pnpm8BL61tq4of6o1_500.gif',
//       'Experience': 'https://media.tenor.com/images/07fa8b8675cdb40bf78ef28d766e2a9b/tenor.gif',
//       'Fulfilling target': 'https://media1.tenor.com/images/018b82b7b47eb994dcb1c77aa0d49357/tenor.gif',
//       'Opportunities': 'https://media1.tenor.com/images/018b82b7b47eb994dcb1c77aa0d49357/tenor.gif'
//     }
//   },
//   finalMessages: [
//     "It was pleasure talking with you, I am excited to keep working with you more, and of course have a laugh along the way😊!!",
//     "Talk to you next time.",
//     "Thank you have a nice day. 😊"
//   ]
// };

// const SAD_FLOW = {
//   initialQuestion: {
//     messages: [
//       "Hi, it looks like you are having a rough day..😔",
//       "https://media1.tenor.com/images/3e35e47384653347a72b0626ed90cfe6/tenor.gif?itemid=9816214",
//       "Which of the following best describes the problem you are facing?"
//     ],
//     options: [
//       { text: 'Less Opportunities', value: 'Less Opportunities' },
//       { text: 'Ideas Undervalued', value: 'Ideas Undervalued' },
//       { text: 'Disconnected (from work)', value: 'Disconnected (from work)' },
//       { text: 'Unsupportive Manager', value: 'Unsupportive Manager' },
//       { text: 'Trust Issues', value: 'Trust Issues' },
//       { text: 'Less empowerment', value: 'Less empowerment (Zero control over Decision making)' },
//       { text: 'Work Culture', value: 'Work Culture' },
//       { text: 'Work Policies', value: 'Work Policies' },
//       { text: 'Peers', value: 'Peers' },
//       { text: 'Unclear role', value: 'Unclear role' },
//       { text: 'Communication gap', value: 'Communication gap' },
//       { text: 'Unachievable targets', value: 'Unachievable targets' },
//       { text: 'Infrastructure', value: 'Infrastructure' },
//       { text: 'Work Life Balance', value: 'Work Life Balance' }
//     ],
//     gifs: {
//       'Less Opportunities': 'https://media.tenor.com/images/59247714f3b114960746cd12e70aa156/tenor.gif',
//       'Ideas Undervalued': 'https://media.tenor.com/images/59a598e84ce877eb5d0fd287bc0e6570/tenor.gif',
//       'Disconnected (from work)': 'https://media.giphy.com/media/fYSc5d5XwHsRDQBMc9/giphy.gif',
//       'Unsupportive Manager': 'https://64.media.tumblr.com/506a8671740f5704db5cd34f6c089bac/tumblr_n73q3tYGOJ1smcbm7o1_500.gif',
//       'Trust Issues': 'https://media.tenor.com/images/4dc0d395fe7bf0d7bb313a60ad8dd8dd/tenor.gif',
//       'Less empowerment (Zero control over Decision making)': 'https://media.giphy.com/media/YkOIc4AbInVzkufx8U/giphy.gif',
//       'Work Culture': 'https://i.pinimg.com/originals/fe/16/95/fe169512003c32ca0deaf8d33d7d6d83.gif',
//       'Work Policies': 'https://media.giphy.com/media/xUPJUKCtjmSxaCIfnO/giphy.gif',
//       'Peers': 'https://media1.tenor.com/images/a90c3d2016c34c7b1b9680be689e38a2/tenor.gif?itemid=3390650',
//       'Unclear role': 'https://media.tenor.com/images/a9cb2c1f5dfff33c20c1156d8c8e84f7/tenor.gif',
//       'Communication gap': 'https://media.giphy.com/media/TLJOmAuCvcGGh0xb3c/giphy.gif',
//       'Unachievable targets': 'https://media.giphy.com/media/3owzWl78kny9s2GOvC/giphy.gif',
//       'Infrastructure': 'https://kmtgroup.co.za/wp-content/uploads/2019/08/infra-1.gif',
//       'Work Life Balance': 'https://cdn.dribbble.com/users/953331/screenshots/6511780/worklifebalance_dribbble.gif'
//     }
//   },
//   secondaryQuestion: {
//     question: "Think about what they tell about what is bothering you?",
//     options: [
//       { text: 'Boss/colleagues', value: 'Boss/colleagues' },
//       { text: 'Something bad happened today', value: 'Something bad that happened today' },
//       { text: 'Did not get appreciated', value: 'Did not get appreciated' },
//       { text: 'Wasn\'t able to achieve something', value: 'Wasn\'t able to achieve something' },
//       { text: 'By the work environment', value: 'By the work environment' },
//       { text: 'Had an argument with someone', value: 'Had an argument with someone' },
//       { text: 'Department', value: 'Department' },
//       { text: 'Role', value: 'Role' },
//       { text: 'Work station', value: 'Work station' },
//       { text: 'Other', value: 'Other' }
//     ],
//     gifs: {
//       'Boss/colleagues': 'https://media3.giphy.com/media/xT5LMYcpLi12zkkTVm/giphy.gif',
//       'Something bad that happened today': 'https://media1.tenor.com/images/bcf9ac7bf1f148ff5c632e5c16cca51d/tenor.gif?itemid=16744961',
//       'Did not get appreciated': 'https://media.tenor.com/images/960f4694bdb04d2c709e19673d93a4f0/tenor.gif',
//       'Wasn\'t able to achieve something': 'https://media0.giphy.com/media/3HuJrvIm6jfdkeqPBy/giphy.gif',
//       'By the work environment': 'https://media1.tenor.com/images/d46b1d9c8c7947c6e84942bd336e98d8/tenor.gif?itemid=4412956',
//       'Had an argument with someone': 'https://media1.tenor.com/images/b68dd33c82af7c133b0b22629e00cdb9/tenor.gif?itemid=14891189',
//       'Department': 'https://media1.tenor.com/images/1231e5edc51da122defab27ac817b330/tenor.gif?itemid=13429068',
//       'Role': 'https://media1.tenor.com/images/c75952b989d9e9f792173a67bb5f81a2/tenor.gif?itemid=14850605',
//       'Work station': 'https://media1.tenor.com/images/12932a3301c8355802d458249fd2c6cb/tenor.gif?itemid=11383230'
//     }
//   },
//   finalMessages: [
//     "I will forward your input to my creators and they will get back to you soon.",
//     "Here are some suggestions that may make you feel relaxed: ",
//     "Listening to Music, paint or sketch something out 🎧, Yoga and Meditation 🧘, Re-watch something that makes you feel good 🚗",
//     "It was nice talking to you, I hope you are feeling relaxed after the conversation.😊"
//   ]
// };

// const MAD_FLOW = {
//   initialQuestion: {
//     messages: [
//       "Hi, I see that you are mad 😠",
//       "https://media.tenor.com/images/204371c3eb3e3cf8f24b954965601c48/tenor.gif",
//       "Can you describe what caused you feel this way?"
//     ],
//     options: [
//       { text: 'Peers, boss, colleagues', value: 'Peers, boss, colleagues, people around you' },
//       { text: 'Things that happened today', value: 'Things that happened today' },
//       { text: 'Did not get appreciated', value: 'Did not get appreciated' },
//       { text: 'Had an argument with colleague', value: 'Had an argument with colleague' },
//       { text: 'Annoyed by work environment', value: 'Annoyed by the disturbances of the work environment' },
//       { text: 'Department', value: 'Department' },
//       { text: 'Role', value: 'Role' },
//       { text: 'Other', value: 'Other' }
//     ],
//     gifs: {
//       'Peers, boss, colleagues, people around you': 'https://media1.tenor.com/images/4695160bad4b1dba0a866a2f7ff2cd9a/tenor.gif?itemid=18007423',
//       'Things that happened today': 'https://media1.tenor.com/images/b68dd33c82af7c133b0b22629e00cdb9/tenor.gif?itemid=14891189',
//       'Did not get appreciated': 'https://media3.giphy.com/media/xUySTD7evBn33BMq3K/giphy.gif',
//       'Had an argument with colleague': 'https://media3.giphy.com/media/3o6fJdlKejPY66AqHK/giphy.gif',
//       'Annoyed by the disturbances of the work environment': 'https://media3.giphy.com/media/3ofT5PzgI9FSn8vPaw/giphy.gif',
//       'Department': 'https://media1.tenor.com/images/00c5e6a4740b604bcbabede92b1cdd6c/tenor.gif?itemid=12615097',
//       'Role': 'https://media1.tenor.com/images/c75952b989d9e9f792173a67bb5f81a2/tenor.gif?itemid=14850605'
//     }
//   },
//   secondaryQuestion: {
//     question: "Think about what they tell about what is bothering you?",
//     options: [
//       { text: 'Work Pressure', value: 'Work Pressure' },
//       { text: 'Depression', value: 'Depression' },
//       { text: 'Personal Issues at work', value: 'Personal Issues at the time of work' },
//       { text: 'Unorganized Work', value: 'Unorganized Work' },
//       { text: 'Hygiene', value: 'Hygiene' },
//       { text: 'No clarity in communication', value: 'No clarity in communication' },
//       { text: 'Infrastructure', value: 'Infrastructure' }
//     ],
//     gifs: {
//       'Work Pressure': 'https://i.gifer.com/2A83.gif',
//       'Depression': 'https://media1.tenor.com/images/a5788318206710f0f59e7147a896d291/tenor.gif',
//       'Personal Issues at the time of work': 'https://media.giphy.com/media/U16OUT29Z6AbNqnqkn/giphy.gif',
//       'Unorganized Work': 'https://media3.giphy.com/media/ZD8ZjehSsLDZQRKJjJ/giphy.gif',
//       'Hygiene': 'https://66.media.tumblr.com/eb9048d0bf3fcabd61f73d17ba356ff7/tumblr_n9mzlc2Owu1ql5yr7o1_500.gif',
//       'No clarity in communication': 'https://i.pinimg.com/originals/92/4b/0e/924b0ec02c6521302cb630f476de21d0.gif',
//       'Infrastructure': 'https://31.media.tumblr.com/506a8671740f5704db5cd34f6c089bac/tumblr_n73q3tYGOJ1smcbm7o1_500.gif'
//     }
//   },
//   finalMessages: [
//     "Humans feel depressed angry and frustrated when something they are trying to do is blocked or something has not been according to their wish?",
//     "Now turn that frown☹ upside down😊 even if it means standing on your head",
//     "I will forward your input to my creators and they will get back to you soon.",
//     "Here are some suggestions that may make you feel relaxed: ",
//     "Listening to Music, paint or sketch something out 🎧, Yoga and Meditation 🧘, Re-watch something that makes you feel good 🚗",
//     "It was nice chatting with you, mDOJO is signing off now."
//   ]
// };

// const ChatScreen = () => {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [chatState, setChatState] = useState(CHAT_STATES.EMPLOYEE_ID);
//   const [employeeId, setEmployeeId] = useState('');
//   const [selectedMood, setSelectedMood] = useState(null);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [selectedSecondaryOption, setSelectedSecondaryOption] = useState(null);
//   const [currentFlow, setCurrentFlow] = useState(null);
//   const [elaboration, setElaboration] = useState('');
//   const [showOptions, setShowOptions] = useState(false);
//   const [showSecondaryOptions, setShowSecondaryOptions] = useState(false);
//   const scrollViewRef = useRef(null);
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   useEffect(() => {
//     const welcomeMessage = {
//       id: 1,
//       text: "Welcome to mDojo! Please enter your Employee ID to continue.",
//       isUser: false,
//       time: new Date()
//     };
//     setMessages([welcomeMessage]);
//   }, []);
// useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages, showOptions, showSecondaryOptions]);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);
//   // ... (keep all your existing useEffect hooks for scrolling and animation)

//   const saveEmployeeMood = async () => {
//     try {
//       await addDoc(collection(db, 'employeeMoods'), {
//         employeeId,
//         mood: selectedMood,
//         timestamp: new Date()
//       });
//     } catch (error) {
//       console.error("Error saving employee mood: ", error);
//     }
//   };

//   const saveChatResponse = async () => {
//     try {
//       await addDoc(collection(db, 'chatResponses'), {
//         employeeId,
//         mood: selectedMood,
//         primaryOption: selectedOption,
//         secondaryOption: selectedSecondaryOption,
//         elaboration,
//         timestamp: new Date()
//       });
//     } catch (error) {
//       console.error("Error saving chat response: ", error);
//     }
//   };

//   const updateMoodCount = async () => {
//     try {
//       const moodCountRef = doc(db, 'moodCounts', 'currentCounts');
//       await setDoc(moodCountRef, {
//         [selectedMood]: increment(1)
//       }, { merge: true });
//     } catch (error) {
//       console.error("Error updating mood count: ", error);
//     }
//   };

//   const handleEmployeeIdSubmit = async () => {
//     const trimmedId = employeeId.trim();
//     if (!trimmedId) return;

//     const userMessage = {
//       id: Date.now(),
//       text: `Employee ID: ${trimmedId}`,
//       isUser: true,
//       time: new Date()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setEmployeeId('');

//     setTimeout(() => {
//       showMoodSelection();
//     }, 500);
//   };

//   const handleMoodSelect = async (mood) => {
//     const moodData = MOODS.find(m => m.id === mood);
//     setSelectedMood(mood);
    
//     const userMoodMessage = {
//       id: Date.now(),
//       text: moodData.label,
//       isUser: true,
//       time: new Date()
//     };

//     setMessages(prev => [...prev, userMoodMessage]);
    
//     // Save the employee mood to Firebase
//     await saveEmployeeMood();
    
//     // Update the mood count in Firebase
//     await updateMoodCount();
    
//     // Set the current flow based on mood
//     if (mood === 'glad') setCurrentFlow(GLAD_FLOW);
//     else if (mood === 'sad') setCurrentFlow(SAD_FLOW);
//     else if (mood === 'mad') setCurrentFlow(MAD_FLOW);
    
//     setTimeout(() => {
//       showInitialQuestion(mood);
//     }, 500);
//   };

//   const handleElaborationSubmit = async () => {
//     if (!elaboration.trim()) return;

//     const elaborationMessage = {
//       id: Date.now(),
//       text: elaboration,
//       isUser: true,
//       time: new Date()
//     };

//     setMessages(prev => [...prev, elaborationMessage]);
//     setElaboration('');
    
//     // Save the complete chat response to Firebase
//     await saveChatResponse();
    
//     setTimeout(() => {
//       showFinalMessages();
//     }, 500);
//   };
//   const handleSend = () => {
//     if (chatState === CHAT_STATES.EMPLOYEE_ID) {
//       handleEmployeeIdSubmit();
//     } else if (chatState === CHAT_STATES.ELABORATION) {
//       handleElaborationSubmit();
//     }
//   };
//   const isSendDisabled = () => {
//     if (chatState === CHAT_STATES.MOOD_SELECTION || 
//         chatState === CHAT_STATES.THANK_YOU ||
//         chatState === CHAT_STATES.FOLLOW_UP ||
//         chatState === CHAT_STATES.SECONDARY_QUESTION) {
//       return true;
//     }
    
//     if (chatState === CHAT_STATES.EMPLOYEE_ID) {
//       return !employeeId || !employeeId.trim();
//     }
    
//     if (chatState === CHAT_STATES.ELABORATION) {
//       return !elaboration || !elaboration.trim();
//     }
    
//     return !message || !message.trim();
//   };
//   const showMoodSelection = () => {
//     const moodQuestion = {
//       id: Date.now() + 1,
//       text: "How are you feeling today?",
//       isUser: false,
//       time: new Date(),
//       isMoodQuestion: true
//     };
    
//     setMessages(prev => [...prev, moodQuestion]);
//     setChatState(CHAT_STATES.MOOD_SELECTION);
//   };
//     const showInitialQuestion = (mood) => {
//     const flow = mood === 'glad' ? GLAD_FLOW : mood === 'sad' ? SAD_FLOW : MAD_FLOW;
    
//     // First message (text)
//     const firstMessage = {
//       id: Date.now() + 1,
//       text: flow.initialQuestion.messages[0],
//       isUser: false,
//       time: new Date()
//     };
    
//     setMessages(prev => [...prev, firstMessage]);
    
//     // Second message (GIF)
//     setTimeout(() => {
//       const gifMessage = {
//         id: Date.now() + 2,
//         text: flow.initialQuestion.messages[1],
//         isUser: false,
//         time: new Date(),
//         isGif: true
//       };
//       setMessages(prev => [...prev, gifMessage]);
      
//       // Third message (question)
//       setTimeout(() => {
//         const questionMessage = {
//           id: Date.now() + 3,
//           text: flow.initialQuestion.messages[2],
//           isUser: false,
//           time: new Date(),
//           isFollowUp: true
//         };
//         setMessages(prev => [...prev, questionMessage]);
//         setChatState(CHAT_STATES.FOLLOW_UP);
//         setShowOptions(true);
//       }, 1000);
//     }, 1000);
//   };
//   const handleOptionSelect = (option) => {
//     const optionMessage = {
//       id: Date.now(),
//       text: option.text,
//       isUser: true,
//       time: new Date()
//     };

//     setSelectedOption(option.value);
//     setMessages(prev => [...prev, optionMessage]);
//     setShowOptions(false);
    
//     setTimeout(() => {
//       // Show the GIF for the selected option
//       const gifUrl = currentFlow.initialQuestion.gifs[option.value];
//       if (gifUrl) {
//         const gifMessage = {
//           id: Date.now() + 1,
//           text: gifUrl,
//           isUser: false,
//           time: new Date(),
//           isGif: true
//         };
//         setMessages(prev => [...prev, gifMessage]);
//       }
      
//       // Show the secondary question
//       setTimeout(() => {
//         const secondaryQuestion = {
//           id: Date.now() + 2,
//           text: currentFlow.secondaryQuestion.question,
//           isUser: false,
//           time: new Date(),
//           isFollowUp: true
//         };
//         setMessages(prev => [...prev, secondaryQuestion]);
//         setChatState(CHAT_STATES.SECONDARY_QUESTION);
//         setShowSecondaryOptions(true);
//       }, 1000);
//     }, 500);
//   };
//   const handleSecondaryOptionSelect = (option) => {
//     const optionMessage = {
//       id: Date.now(),
//       text: option.text,
//       isUser: true,
//       time: new Date()
//     };

//     setSelectedSecondaryOption(option.value);
//     setMessages(prev => [...prev, optionMessage]);
//     setShowSecondaryOptions(false);
    
//     setTimeout(() => {
//       // Show the GIF for the selected secondary option
//       const gifUrl = currentFlow.secondaryQuestion.gifs[option.value];
//       if (gifUrl) {
//         const gifMessage = {
//           id: Date.now() + 1,
//           text: gifUrl,
//           isUser: false,
//           time: new Date(),
//           isGif: true
//         };
//         setMessages(prev => [...prev, gifMessage]);
//       }
      
//       // Ask for elaboration
//       setTimeout(() => {
//         const elaborationPrompt = {
//           id: Date.now() + 2,
//           text: "Please elaborate on your options chosen above. Share evidences.",
//           isUser: false,
//           time: new Date()
//         };
//         setMessages(prev => [...prev, elaborationPrompt]);
//         setChatState(CHAT_STATES.ELABORATION);
//       }, 1000);
//     }, 500);
//   };
// const showFinalMessages = () => {
//     const finalMessages = currentFlow.finalMessages;
    
//     finalMessages.forEach((msg, index) => {
//       setTimeout(() => {
//         const finalMessage = {
//           id: Date.now() + index,
//           text: msg,
//           isUser: false,
//           time: new Date()
//         };
//         setMessages(prev => [...prev, finalMessage]);
        
//         if (index === finalMessages.length - 1) {
//           setChatState(CHAT_STATES.THANK_YOU);
//         }
//       }, index * 1000);
//     });
//   };
//    const renderMoodSelection = () => {
//       if (chatState !== CHAT_STATES.MOOD_SELECTION) return null;
      
//       return (
//         <View style={styles.moodSelectionContainer}>
//           <Text style={styles.sectionTitle}>How are you feeling today?</Text>
//           <View style={styles.moodGrid}>
//             {MOODS.map((mood) => (
//               <TouchableOpacity
//                 key={mood.id}
//                 style={[
//                   styles.moodCard,
//                   selectedMood === mood.id && styles.selectedMoodCard,
//                   { borderColor: mood.color }
//                 ]}
//                 onPress={() => handleMoodSelect(mood.id)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.moodEmoji}>{mood.emoji}</Text>
//                 <Text style={styles.moodLabel}>{mood.label}</Text>
//                 {selectedMood === mood.id && (
//                   <View style={[styles.selectionIndicator, { backgroundColor: mood.color }]} />
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       );
//     };
  
//     const renderFollowUpOptions = () => {
//       if (!showOptions || chatState !== CHAT_STATES.FOLLOW_UP || !selectedMood || !currentFlow) return null;
      
//       return (
//         <View style={styles.optionsContainer}>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.optionsScrollContent}
//           >
//             {currentFlow.initialQuestion.options.map((option, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.optionButton,
//                   { backgroundColor: '#E31937' }
//                 ]}
//                 onPress={() => handleOptionSelect(option)}
//               >
//                 {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
//                 <Text style={styles.optionText}>{option.text}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       );
//     };
  
//     const renderSecondaryOptions = () => {
//       if (!showSecondaryOptions || chatState !== CHAT_STATES.SECONDARY_QUESTION || !selectedMood || !currentFlow) return null;
      
//       return (
//         <View style={styles.optionsContainer}>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.optionsScrollContent}
//           >
//             {currentFlow.secondaryQuestion.options.map((option, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.optionButton,
//                   { backgroundColor: '#E31937' }
//                 ]}
//                 onPress={() => handleSecondaryOptionSelect(option)}
//               >
//                 <Text style={styles.optionText}>{option.text}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       );
//     };
  
//     const renderInputField = () => {
//       if (chatState === CHAT_STATES.EMPLOYEE_ID) {
//         return (
//           <TextInput
//             style={[
//               styles.input,
//               styles.employeeIdInput
//             ]}
//             value={employeeId}
//             onChangeText={setEmployeeId}
//             placeholder='Enter Employee ID (e.g., EMP001)'
//             placeholderTextColor="#999"
//             multiline
//             onSubmitEditing={() => !isSendDisabled() && handleSend()}
//             returnKeyType="send"
//           />
//         );
//       } else if (chatState === CHAT_STATES.ELABORATION) {
//         return (
//           <TextInput
//             style={styles.input}
//             value={elaboration}
//             onChangeText={setElaboration}
//             placeholder='Please elaborate on your choices...'
//             placeholderTextColor="#999"
//             multiline
//             onSubmitEditing={() => !isSendDisabled() && handleSend()}
//             returnKeyType="send"
//           />
//         );
//       }
//       return null;
//     };
//   // ... (keep all your other existing functions like showMoodSelection, showInitialQuestion, 
//   // handleOptionSelect, handleSecondaryOptionSelect, showFinalMessages, etc.)

//   // ... (keep all your existing render functions like renderMoodSelection, 
//   // renderFollowUpOptions, renderSecondaryOptions, renderInputField)

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.background}>
//         <View style={styles.chatContainer}>
//           <View style={styles.chatHeader}>
//             <Text style={styles.chatHeaderText}>mDojo</Text>
//           </View>
          
//           <ScrollView 
//             ref={scrollViewRef}
//             contentContainerStyle={styles.messagesContainer}
//             style={styles.messagesScrollView}
//           >
//             {messages.map((msg) => (
//               <Animated.View 
//                 key={msg.id} 
//                 style={[
//                   styles.messageBubble, 
//                   msg.isUser ? styles.userBubble : styles.botBubble,
//                   { opacity: fadeAnim }
//                 ]}
//               >
//                 {msg.isGif ? (
//                   <Image 
//                     source={{ uri: msg.text }}
//                     style={styles.gifImage}
//                     resizeMode="contain"
//                   />
//                 ) : (
//                   <Text style={msg.isUser ? styles.userText : styles.botText}>
//                     {msg.text}
//                   </Text>
//                 )}
//                 <Text style={[
//                   styles.timeText,
//                   msg.isUser ? styles.userTimeText : {}
//                 ]}>
//                   {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </Text>
//               </Animated.View>
//             ))}
//             {renderMoodSelection()}
//             {renderFollowUpOptions()}
//             {renderSecondaryOptions()}
//           </ScrollView>

//           {(chatState === CHAT_STATES.EMPLOYEE_ID || chatState === CHAT_STATES.ELABORATION) && (
//             <View style={styles.inputContainer}>
//               {renderInputField()}
//               <TouchableOpacity 
//                 onPress={handleSend} 
//                 style={[
//                   styles.sendButton,
//                   isSendDisabled() && styles.sendButtonDisabled
//                 ]}
//                 disabled={isSendDisabled()}
//               >
//                 <MaterialIcons 
//                   name="send" 
//                   size={22} 
//                   color="#fff" 
//                   style={styles.sendIcon}
//                 />
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// // ... (keep all your existing styles)

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#E31937',
//   },
//   background: {
//     flex: 1,
//     backgroundColor: '#E31937',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   chatContainer: {
//     width: '100%',
//     maxWidth: 1000,
//     height: height * 0.9,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   chatHeader: {
//     backgroundColor: '#E31937',
//     padding: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   chatHeaderText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   messagesScrollView: {
//     flex: 1,
//   },
//   messagesContainer: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     padding: 12,
//     borderRadius: 15,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   botBubble: {
//     backgroundColor: '#f5f5f5',
//     borderTopLeftRadius: 4,
//     borderBottomRightRadius: 15,
//     borderTopRightRadius: 15,
//     alignSelf: 'flex-start',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   userBubble: {
//     backgroundColor: '#E31937',
//     borderTopLeftRadius: 15,
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 4,
//     alignSelf: 'flex-end',
//   },
//   botText: {
//     color: '#333',
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   userText: {
//     color: '#fff',
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   timeText: {
//     fontSize: 10,
//     color: '#999',
//     marginTop: 4,
//     textAlign: 'right',
//   },
//   userTimeText: {
//     color: 'rgba(255, 255, 255, 0.7)',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     paddingBottom: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   input: {
//     flex: 1,
//     maxHeight: 120,
//     minHeight: 48,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#f8f8f8',
//     textAlignVertical: 'center',
//     includeFontPadding: false,
//     color: '#333',
//   },
//   employeeIdInput: {
//     fontFamily: 'monospace',
//     letterSpacing: 1,
//   },
//   sendButton: {
//     marginLeft: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E31937',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   sendIcon: {
//     marginLeft: 2,
//     marginTop: 1,
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#cccccc',
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   moodSelectionContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     margin: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   moodGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     flexWrap: 'wrap',
//     marginHorizontal: -4,
//   },
//   moodCard: {
//     width: '31%',
//     aspectRatio: 1,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   selectedMoodCard: {
//     transform: [{ scale: 1.08 }],
//     elevation: 10,
//     shadowRadius: 10,
//   },
//   moodEmoji: {
//     fontSize: 32,
//     marginBottom: 8,
//   },
//   moodLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//   },
//   selectionIndicator: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 6,
//   },
//   optionsContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginHorizontal: 16,
//     marginBottom: 10,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   optionsScrollContent: {
//     paddingHorizontal: 8,
//   },
//   optionButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginRight: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minWidth: 120,
//   },
//   optionText: {
//     color: '#fff',
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   optionEmoji: {
//     fontSize: 20,
//     color: '#fff',
//   },
//   gifImage: {
//     width: 200,
//     height: 150,
//     borderRadius: 10,
//   },
// });

// export default ChatScreen;

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
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

const CHAT_STATES = {
  EMPLOYEE_ID: 'EMPLOYEE_ID',
  MOOD_SELECTION: 'MOOD_SELECTION',
  FOLLOW_UP: 'FOLLOW_UP',
  SECONDARY_QUESTION: 'SECONDARY_QUESTION',
  ELABORATION: 'ELABORATION',
  FINAL_MESSAGE: 'FINAL_MESSAGE',
  THANK_YOU: 'THANK_YOU'
};

const MOODS = [
  { id: 'glad', label: 'Glad 😊!', emoji: '😊', color: '#E31937' },
  { id: 'sad', label: 'Sad 😢!', emoji: '😢', color: '#E31937' },
  { id: 'mad', label: 'Mad 😠!', emoji: '😠', color: '#E31937' }
];

// ... (keep all your existing GLAD_FLOW, SAD_FLOW, MAD_FLOW constants as they are)
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
      { text: 'Great Career', emoji: '📈', value: 'Great Career' },
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
    question: "Did you get something that you were willing to have? Please describe your choice.",
    options: [
      { text: 'Constructive Feedback', value: 'Constructive Feedback' },
      { text: 'Appreciation', value: 'Appreciation' },
      { text: 'Good food', value: 'Good food' },
      { text: 'Experience', value: 'Experience' },
      { text: 'Fulfilling target', value: 'Fulfilling target' },
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
  finalMessages: [
    "It was pleasure talking with you, I am excited to keep working with you more, and of course have a laugh along the way😊!!",
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
      { text: 'Less Opportunities', value: 'Less Opportunities' },
      { text: 'Ideas Undervalued', value: 'Ideas Undervalued' },
      { text: 'Disconnected (from work)', value: 'Disconnected (from work)' },
      { text: 'Unsupportive Manager', value: 'Unsupportive Manager' },
      { text: 'Trust Issues', value: 'Trust Issues' },
      { text: 'Less empowerment', value: 'Less empowerment (Zero control over Decision making)' },
      { text: 'Work Culture', value: 'Work Culture' },
      { text: 'Work Policies', value: 'Work Policies' },
      { text: 'Peers', value: 'Peers' },
      { text: 'Unclear role', value: 'Unclear role' },
      { text: 'Communication gap', value: 'Communication gap' },
      { text: 'Unachievable targets', value: 'Unachievable targets' },
      { text: 'Infrastructure', value: 'Infrastructure' },
      { text: 'Work Life Balance', value: 'Work Life Balance' }
    ],
    gifs: {
      'Less Opportunities': 'https://media.tenor.com/images/59247714f3b114960746cd12e70aa156/tenor.gif',
      'Ideas Undervalued': 'https://media.tenor.com/images/59a598e84ce877eb5d0fd287bc0e6570/tenor.gif',
      'Disconnected (from work)': 'https://media.giphy.com/media/fYSc5d5XwHsRDQBMc9/giphy.gif',
      'Unsupportive Manager': 'https://64.media.tumblr.com/506a8671740f5704db5cd34f6c089bac/tumblr_n73q3tYGOJ1smcbm7o1_500.gif',
      'Trust Issues': 'https://media.tenor.com/images/4dc0d395fe7bf0d7bb313a60ad8dd8dd/tenor.gif',
      'Less empowerment (Zero control over Decision making)': 'https://media.giphy.com/media/YkOIc4AbInVzkufx8U/giphy.gif',
      'Work Culture': 'https://i.pinimg.com/originals/fe/16/95/fe169512003c32ca0deaf8d33d7d6d83.gif',
      'Work Policies': 'https://media.giphy.com/media/xUPJUKCtjmSxaCIfnO/giphy.gif',
      'Peers': 'https://media1.tenor.com/images/a90c3d2016c34c7b1b9680be689e38a2/tenor.gif?itemid=3390650',
      'Unclear role': 'https://media.tenor.com/images/a9cb2c1f5dfff33c20c1156d8c8e84f7/tenor.gif',
      'Communication gap': 'https://media.giphy.com/media/TLJOmAuCvcGGh0xb3c/giphy.gif',
      'Unachievable targets': 'https://media.giphy.com/media/3owzWl78kny9s2GOvC/giphy.gif',
      'Infrastructure': 'https://kmtgroup.co.za/wp-content/uploads/2019/08/infra-1.gif',
      'Work Life Balance': 'https://cdn.dribbble.com/users/953331/screenshots/6511780/worklifebalance_dribbble.gif'
    }
  },
  secondaryQuestion: {
    question: "Think about what they tell about what is bothering you?",
    options: [
      { text: 'Boss/colleagues', value: 'Boss/colleagues' },
      { text: 'Something bad happened today', value: 'Something bad that happened today' },
      { text: 'Did not get appreciated', value: 'Did not get appreciated' },
      { text: 'Wasn\'t able to achieve something', value: 'Wasn\'t able to achieve something' },
      { text: 'By the work environment', value: 'By the work environment' },
      { text: 'Had an argument with someone', value: 'Had an argument with someone' },
      { text: 'Department', value: 'Department' },
      { text: 'Role', value: 'Role' },
      { text: 'Work station', value: 'Work station' },
      { text: 'Other', value: 'Other' }
    ],
    gifs: {
      'Boss/colleagues': 'https://media3.giphy.com/media/xT5LMYcpLi12zkkTVm/giphy.gif',
      'Something bad that happened today': 'https://media1.tenor.com/images/bcf9ac7bf1f148ff5c632e5c16cca51d/tenor.gif?itemid=16744961',
      'Did not get appreciated': 'https://media.tenor.com/images/960f4694bdb04d2c709e19673d93a4f0/tenor.gif',
      'Wasn\'t able to achieve something': 'https://media0.giphy.com/media/3HuJrvIm6jfdkeqPBy/giphy.gif',
      'By the work environment': 'https://media1.tenor.com/images/d46b1d9c8c7947c6e84942bd336e98d8/tenor.gif?itemid=4412956',
      'Had an argument with someone': 'https://media1.tenor.com/images/b68dd33c82af7c133b0b22629e00cdb9/tenor.gif?itemid=14891189',
      'Department': 'https://media1.tenor.com/images/1231e5edc51da122defab27ac817b330/tenor.gif?itemid=13429068',
      'Role': 'https://media1.tenor.com/images/c75952b989d9e9f792173a67bb5f81a2/tenor.gif?itemid=14850605',
      'Work station': 'https://media1.tenor.com/images/12932a3301c8355802d458249fd2c6cb/tenor.gif?itemid=11383230'
    }
  },
  finalMessages: [
    "I will forward your input to my creators and they will get back to you soon.",
    "Here are some suggestions that may make you feel relaxed: ",
    "Listening to Music, paint or sketch something out 🎧, Yoga and Meditation 🧘, Re-watch something that makes you feel good 🚗",
    "It was nice talking to you, I hope you are feeling relaxed after the conversation.😊"
  ]
};

const MAD_FLOW = {
  initialQuestion: {
    messages: [
      "Hi, I see that you are mad 😠",
      "https://media.tenor.com/images/204371c3eb3e3cf8f24b954965601c48/tenor.gif",
      "Can you describe what caused you feel this way?"
    ],
    options: [
      { text: 'Peers, boss, colleagues', value: 'Peers, boss, colleagues, people around you' },
      { text: 'Things that happened today', value: 'Things that happened today' },
      { text: 'Did not get appreciated', value: 'Did not get appreciated' },
      { text: 'Had an argument with colleague', value: 'Had an argument with colleague' },
      { text: 'Annoyed by work environment', value: 'Annoyed by the disturbances of the work environment' },
      { text: 'Department', value: 'Department' },
      { text: 'Role', value: 'Role' },
      { text: 'Other', value: 'Other' }
    ],
    gifs: {
      'Peers, boss, colleagues, people around you': 'https://media1.tenor.com/images/4695160bad4b1dba0a866a2f7ff2cd9a/tenor.gif?itemid=18007423',
      'Things that happened today': 'https://media1.tenor.com/images/b68dd33c82af7c133b0b22629e00cdb9/tenor.gif?itemid=14891189',
      'Did not get appreciated': 'https://media3.giphy.com/media/xUySTD7evBn33BMq3K/giphy.gif',
      'Had an argument with colleague': 'https://media3.giphy.com/media/3o6fJdlKejPY66AqHK/giphy.gif',
      'Annoyed by the disturbances of the work environment': 'https://media3.giphy.com/media/3ofT5PzgI9FSn8vPaw/giphy.gif',
      'Department': 'https://media1.tenor.com/images/00c5e6a4740b604bcbabede92b1cdd6c/tenor.gif?itemid=12615097',
      'Role': 'https://media1.tenor.com/images/c75952b989d9e9f792173a67bb5f81a2/tenor.gif?itemid=14850605'
    }
  },
  secondaryQuestion: {
    question: "Think about what they tell about what is bothering you?",
    options: [
      { text: 'Work Pressure', value: 'Work Pressure' },
      { text: 'Depression', value: 'Depression' },
      { text: 'Personal Issues at work', value: 'Personal Issues at the time of work' },
      { text: 'Unorganized Work', value: 'Unorganized Work' },
      { text: 'Hygiene', value: 'Hygiene' },
      { text: 'No clarity in communication', value: 'No clarity in communication' },
      { text: 'Infrastructure', value: 'Infrastructure' }
    ],
    gifs: {
      'Work Pressure': 'https://i.gifer.com/2A83.gif',
      'Depression': 'https://media1.tenor.com/images/a5788318206710f0f59e7147a896d291/tenor.gif',
      'Personal Issues at the time of work': 'https://media.giphy.com/media/U16OUT29Z6AbNqnqkn/giphy.gif',
      'Unorganized Work': 'https://media3.giphy.com/media/ZD8ZjehSsLDZQRKJjJ/giphy.gif',
      'Hygiene': 'https://66.media.tumblr.com/eb9048d0bf3fcabd61f73d17ba356ff7/tumblr_n9mzlc2Owu1ql5yr7o1_500.gif',
      'No clarity in communication': 'https://i.pinimg.com/originals/92/4b/0e/924b0ec02c6521302cb630f476de21d0.gif',
      'Infrastructure': 'https://31.media.tumblr.com/506a8671740f5704db5cd34f6c089bac/tumblr_n73q3tYGOJ1smcbm7o1_500.gif'
    }
  },
  finalMessages: [
    "Humans feel depressed angry and frustrated when something they are trying to do is blocked or something has not been according to their wish?",
    "Now turn that frown☹ upside down😊 even if it means standing on your head",
    "I will forward your input to my creators and they will get back to you soon.",
    "Here are some suggestions that may make you feel relaxed: ",
    "Listening to Music, paint or sketch something out 🎧, Yoga and Meditation 🧘, Re-watch something that makes you feel good 🚗",
    "It was nice chatting with you, mDOJO is signing off now."
  ]
};

const ChatScreen = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATES.EMPLOYEE_ID);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSecondaryOption, setSelectedSecondaryOption] = useState(null);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [elaboration, setElaboration] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showSecondaryOptions, setShowSecondaryOptions] = useState(false);
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
  // ... (keep all your existing useEffect hooks for scrolling and animation)

 const saveEmployeeMood = async (id, mood) => {
  try {
    if (!mood) {
      console.warn("Missing employeeId or mood", { id, mood });
      return;
    }
    
    console.log("Saving employee mood:", { employeeId: id, mood });
    
    await addDoc(collection(db, 'employeeMoods'), {
      employeeId: id.trim(),
      mood: mood,
      timestamp: new Date()
    });
    
    console.log("Employee mood saved successfully");
  } catch (error) {
    console.error("Error saving employee mood: ", error);
    Alert.alert("Error", "Failed to save mood. Please try again.");
  }
};

  const saveChatResponse = async () => {
    try {
      await addDoc(collection(db, 'chatResponses'), {
        employeeId,
        mood: selectedMood,
        primaryOption: selectedOption,
        secondaryOption: selectedSecondaryOption,
        elaboration,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error saving chat response: ", error);
    }
  };

  const updateMoodCount = async (mood) => {
  try {
    if (!mood) {
      console.warn("No mood provided for count update");
      return;
    }
    
    const moodCountRef = doc(db, 'moodCounts', 'currentCounts');
    await setDoc(moodCountRef, {
      [mood]: increment(1)
    }, { merge: true });
    console.log("Mood count updated successfully for:", mood);
  } catch (error) {
    console.error("Error updating mood count: ", error);
    Alert.alert("Error", "Failed to update mood count.");
  }
};

  const handleEmployeeIdSubmit = async () => {
  const trimmedId = employeeId.trim();
  console.log("Submitting employee ID:", trimmedId); // Debug log
  
  if (!trimmedId) {
    Alert.alert("Error", "Please enter a valid Employee ID");
    return;
  }

  const userMessage = {
    id: Date.now(),
    text: `Employee ID: ${trimmedId}`,
    isUser: true,
    time: new Date()
  };
  
  setMessages(prev => [...prev, userMessage]);
  // Keep the original untrimmed ID in state for display
  setEmployeeId(trimmedId); 

  console.log("Before mood selection, current employeeId:", employeeId); // Debug log
  
  setTimeout(() => {
    console.log("Showing mood selection, current employeeId:", employeeId); // Debug log
    showMoodSelection();
  }, 500);
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
    await saveEmployeeMood(employeeId, mood);
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
    
    // Save the complete chat response to Firebase
    await saveChatResponse();
    
    setTimeout(() => {
      showFinalMessages();
    }, 500);
  };
  const handleSend = () => {
    if (chatState === CHAT_STATES.EMPLOYEE_ID) {
      handleEmployeeIdSubmit();
    } else if (chatState === CHAT_STATES.ELABORATION) {
      handleElaborationSubmit();
    }
  };
  const isSendDisabled = () => {
    if (chatState === CHAT_STATES.MOOD_SELECTION || 
        chatState === CHAT_STATES.THANK_YOU ||
        chatState === CHAT_STATES.FOLLOW_UP ||
        chatState === CHAT_STATES.SECONDARY_QUESTION) {
      return true;
    }
    
    if (chatState === CHAT_STATES.EMPLOYEE_ID) {
      return !employeeId || !employeeId.trim();
    }
    
    if (chatState === CHAT_STATES.ELABORATION) {
      return !elaboration || !elaboration.trim();
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
    
    // First message (text)
    const firstMessage = {
      id: Date.now() + 1,
      text: flow.initialQuestion.messages[0],
      isUser: false,
      time: new Date()
    };
    
    setMessages(prev => [...prev, firstMessage]);
    
    // Second message (GIF)
    setTimeout(() => {
      const gifMessage = {
        id: Date.now() + 2,
        text: flow.initialQuestion.messages[1],
        isUser: false,
        time: new Date(),
        isGif: true
      };
      setMessages(prev => [...prev, gifMessage]);
      
      // Third message (question)
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
      // Show the GIF for the selected option
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
      
      // Show the secondary question
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
      // Show the GIF for the selected secondary option
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
      
      // Ask for elaboration
      setTimeout(() => {
        const elaborationPrompt = {
          id: Date.now() + 2,
          text: "Please elaborate on your options chosen above. Share evidences.",
          isUser: false,
          time: new Date()
        };
        setMessages(prev => [...prev, elaborationPrompt]);
        setChatState(CHAT_STATES.ELABORATION);
      }, 1000);
    }, 500);
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
  // Only render when in MOOD_SELECTION state and no mood has been selected yet
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
      
      return (
        <View style={styles.optionsContainer}>
          <ScrollView 
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
        </View>
      );
    };
  
    const renderSecondaryOptions = () => {
      if (!showSecondaryOptions || chatState !== CHAT_STATES.SECONDARY_QUESTION || !selectedMood || !currentFlow) return null;
      
      return (
        <View style={styles.optionsContainer}>
          <ScrollView 
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
      );
    };
  
    const renderInputField = () => {
      if (chatState === CHAT_STATES.EMPLOYEE_ID) {
        return (
          <TextInput
            style={[
              styles.input,
              styles.employeeIdInput
            ]}
            value={employeeId}
            onChangeText={setEmployeeId}
            placeholder='Enter Employee ID (e.g., EMP001)'
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={() => !isSendDisabled() && handleSend()}
            returnKeyType="send"
          />
        );
      } else if (chatState === CHAT_STATES.ELABORATION) {
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
        <View style={styles.mahendraContainer}>
          <Text style={styles.mahendraText}>MAHENDRA</Text>
        </View>
        <View style={styles.mlogo}>
          <Image 
            source={require('../assets/images/image.png')} 
            style={styles.mahendra}
            resizeMode="contain"
          />
        </View>
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
          </ScrollView>

          {(chatState === CHAT_STATES.EMPLOYEE_ID || chatState === CHAT_STATES.ELABORATION) && (
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
});

export default ChatScreen;