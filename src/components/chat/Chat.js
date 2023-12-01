import React, {  useState, useEffect, useRef, useReducer, forwardRef, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './history/ChatHistory';
import TextToSpeech from './TextToSpeech';
import { fetchBotReply } from '../hooks';
import { Ollama } from "langchain/llms/ollama";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import Logo from './QuillBot.png';
import SpeedIcon from '@mui/icons-material/Speed';


const getEEGData = async () => {
  try {
    // Fetching the data
    const response = await fetch('http://localhost:5000/api/fetch-data');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();

    // Process the data to calculate averages
    const averages = calculateChannelAverages(json.data);

    // Return the averages as a JSON string
    return JSON.stringify(averages);

  } catch (error) {
    console.error(error.message);
    return '{}'; // Return an empty JSON object in case of an error
  }
};

const calculateChannelAverages = (data) => {
  // Initialize sums and counts for each channel
  const sums = { Delta: 0, Theta: 0, Alpha: 0, Beta: 0, Gamma: 0 };
  const counts = { Delta: 0, Theta: 0, Alpha: 0, Beta: 0, Gamma: 0 };

  // Process each entry
  data.slice(-500).forEach(entry => {
    const values = entry.split(',');
    ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'].forEach((channel, index) => {
      const value = parseFloat(values[index]);
      if (!isNaN(value)) {
        sums[channel] += value;
        counts[channel]++;
      }
    });
  });

  // Calculate and format averages to up to 3 decimal places
  const averages = {};
  for (const channel in sums) {
    averages[channel] = parseFloat((sums[channel] / counts[channel]).toFixed(3));
  }

  return averages;
};




function calculateAverage(list) {
  let sum = 0; // Initialize sum variable to 0

  for (let i = 0; i < list.length; i++) {
    sum += list[i]; // Add each element of the list to the sum
  }

  return sum / list.length; // Return average by dividing sum with length of the list
}




const Chat = forwardRef(({ selectedChatIndex, chats, dispatch, saveChats, isLoading, setChats, eEG }, ref) => {


  const messageEndRef = useRef(null);
  let selectedChat = chats[selectedChatIndex];

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: chats[selectedChatIndex].persona.model,
  });

  const [textToSpeak, setTextToSpeak] = useState('');

  const [wordsPerMinute, setWordsPerMinute] = useState(chats[selectedChatIndex].wpm); // Add this line



  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_CHAT_INDEX', payload: selectedChatIndex });
  }, [selectedChatIndex, chats]);

  useEffect(() => {
    if (selectedChat.chatHistory) {
      scrollToBottom();
    }
  }, [selectedChat.chatHistory]);


  useEffect(() => {
    dispatch({ type: 'UPDATE_CHATS', payload: chats });
    setChats(chats);
  }, [chats]);


  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);


  const renameChatIfNeeded = async (chatHistory, chats, selectedChatIndex, dispatch) => {
    if (chatHistory.length > 2 && chats[selectedChatIndex].name === 'New Chat') {
      // Code to create new name.
      const chatHistoryJson = JSON.stringify(chatHistory);
      const summary = `<chathistory>${chatHistoryJson}</s>\n${'Make a compelling chat title for the chat history, with two words.'}`;
      let newName = await ollama.stream(summary);
      let nn = '';
      for await (const chunk of newName) {
        nn += chunk;
      }
      nn = nn.replace(/['"]+/g, ' '); // fix
      chats[selectedChatIndex].name = nn;
      dispatch({
        type: 'RENAME_CHAT',
        payload: {
          index: selectedChatIndex,
          newName: nn
        }
      });
    }
  };

  const getLastSentence = (text) => {
    // Regular expression now includes commas
    const sentences = text.match(/[^\.!\?,]+[\.!\?,]+/g);
    return sentences ? sentences[sentences.length - 1].trim() : '';
  };


  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const { persona, chatHistory, name } = chats[selectedChatIndex];
    const timestamp = Date.now();
    const timestamp2 = timestamp + 5;

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      eeg: '',
      timestamp:timestamp,
    };

    const botReply = {
      role: 'assistant',
      content: '',
      timestamp: timestamp2,
    };

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      const chatHistoryJson = JSON.stringify(chatHistory);
      const brainwaves = await getEEGData();
      const promptForOllama = eEG
        ? `<chathistory>${chatHistoryJson}</s>\n<EEG>${brainwaves}</s>\n${userMessage}`
        : `<chathistory>${chatHistoryJson}</s>\n${userMessage}`;
      if (eEG) {
        newUserMessage.eeg = brainwaves;
      }
      console.log(promptForOllama);

      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });

      // Call the new function to handle chat renaming
      await renameChatIfNeeded(chatHistory, chats, selectedChatIndex, dispatch);

      const stream = await ollama.stream(promptForOllama);
      let previousSentence = '';
      let chunkCounter = 0; // Counter to track the number of received chunks

      for await (const chunk of stream) {
        botReply.content += chunk;
        dispatch({
          type: 'UPDATE_PARTIAL_BOT_REPLY',
          payload: { timestamp2, chunk }
        });

        chunkCounter++;

        // Check for a new sentence every 5 chunks
        if (chunkCounter % 5 === 0) {
          const currentSentence = getLastSentence(botReply.content);
          if (currentSentence !== previousSentence) {
            setTextToSpeak(currentSentence);
            previousSentence = currentSentence;
          }
        }
      }
      const finalSentence = getLastSentence(botReply.content);
      if (finalSentence !== previousSentence) {
        setTextToSpeak(finalSentence);
      }
      botReply.timestamp = Date.now();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });

      let numWords = botReply.content.split(' ').length;
      let durationInSeconds = Math.round((botReply.timestamp - timestamp) / 1000); // convert milliseconds to seconds
      let numWordsPerSecond = numWords / durationInSeconds;
      let wordSpeed = Math.round(numWordsPerSecond * 60); // multiply by the number of seconds in a minute

      chats[selectedChatIndex].msgSpeeds.push(wordSpeed);
      chats[selectedChatIndex].wpm = calculateAverage(chats[selectedChatIndex].msgSpeeds);
      setWordsPerMinute(chats[selectedChatIndex].wpm);


      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };


  useEffect(() => {
    // This code runs after `state` has been updated
    localStorage.setItem('chats', JSON.stringify(chats));
    setChats(chats);
  }, [chats]); // This will only re-run if `state` changes



  return (
    <div className="chat-container">
    <TextToSpeech textToSpeak={textToSpeak} />
    <div className='infobar'>
      <div className='infostat'>
        <SpeedIcon/>
        <p className='infostattxt'>Words Per Minute: {wordsPerMinute}</p>
      </div>
    </div>
    <header className={`App-header`}>
      <img src={Logo} alt="TokenQuill Logo" className="logo" />
    </header>
    <h1>{selectedChat.persona?.model}</h1>
      <ChatHistory chatHistory={chats[selectedChatIndex].chatHistory} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      <span>TulpaTalk may not always be accurate, it's essential to double-check information.</span>
    </div>

  );
});

export default React.memo(Chat);
