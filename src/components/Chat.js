import React, {  useState, useEffect, useRef, useReducer, forwardRef, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { fetchBotReply } from './hooks';
import { Ollama } from "langchain/llms/ollama";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import TextToSpeech from './TextToSpeech';


const Chat = forwardRef(({ selectedChatIndex, chats, dispatch, saveChats, isLoading, setChats }, ref) => {


  const messageEndRef = useRef(null);
  let selectedChat = chats[selectedChatIndex];

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: chats[selectedChatIndex].persona.model,
  });

  const [textToSpeak, setTextToSpeak] = useState('');


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
    if (chatHistory.length > 3 && chats[selectedChatIndex].name === 'New Chat') {
      // Code to create new name.
      const chatHistoryJson = JSON.stringify(chatHistory);
      const summary = `<chathistory>${chatHistoryJson}</s>\n${'Make a compelling chat title for the chat history, with two words.'}`;
      let newName = await ollama.stream(summary);
      let nn = '';
      for await (const chunk of newName) {
        nn += chunk;
      }
      nn = nn.replace(/['"]+/g, '').split(' ').slice(0, 3).join(' ');
      console.log('new name', nn);
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
      timestamp,
    };

    const botReply = {
      role: 'assistant',
      content: '',
      timestamp: timestamp2,
    };

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      const chatHistoryJson = JSON.stringify(chatHistory);
      const promptForOllama = `<chathistory>${chatHistoryJson}</s>\n${userMessage}`;
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
      console.log('HISTORY',chatHistory);
      let numWords = botReply.content.split(' ').length;
      let durationInSeconds = Math.round((botReply.timestamp - timestamp) / 1000); // convert milliseconds to seconds
      let numWordsPerSecond = numWords / durationInSeconds;
      let wordsPerMinute = Math.round(numWordsPerSecond * 60); // multiply by the number of seconds in a minute

      console.log('wpm', wordsPerMinute);


      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };


  useEffect(() => {
    // This code runs after `state` has been updated
    localStorage.setItem('chats', JSON.stringify(chats));
    console.log('State after update:', chats);
    setChats(chats);
  }, [chats]); // This will only re-run if `state` changes



  return (
    <div className="chat-container">
      <div>
        <TextToSpeech textToSpeak={textToSpeak} />
      </div>
      <ChatHistory chatHistory={chats[selectedChatIndex].chatHistory} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      <div>hiiiiiiii</div>
      <span>TulpaTalk may not always be accurate, it's essential to double-check information.</span>
    </div>

  );
});

export default React.memo(Chat);
