import React, {  useState, useEffect, useRef, useReducer, forwardRef, useImperativeHandle, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { fetchBotReply } from './hooks';
import { Ollama } from "langchain/llms/ollama";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";


const Chat = forwardRef(({ selectedChatIndex, chats, dispatch, saveChats, isLoading, setChats }, ref) => {


  const messageEndRef = useRef(null);

  // Guard against undefined selectedChat
  console.log('index', selectedChatIndex);
  let selectedChat = chats[selectedChatIndex];
  console.log(chats);

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: chats[selectedChatIndex].persona.model,
  });

  useImperativeHandle(ref, () => ({
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
  }));

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


  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const { persona, chatHistory , name } = chats[selectedChatIndex];
    const timestamp = Date.now();
    const timestamp2 = timestamp+5;

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp,
    };

    const botReply = {
      role: 'assistant',
      content: '',
      timestamp: timestamp2, // Set the timestamp immediately to the time message was sent
    };

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      // Add new user message and a placeholder for bot reply to chat history
      const chatHistoryJson = JSON.stringify(chatHistory);
      const promptForOllama = `<|chathistory|>${chatHistoryJson}</s>\n${userMessage}`;

      const stream = await ollama.stream(promptForOllama);
      let finalResponse = '';
      let bt = botReply.timestamp;

      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });

      for await (const chunk of stream) {
        botReply.content += chunk;
        dispatch({
          type: 'UPDATE_PARTIAL_BOT_REPLY',
          payload: { timestamp2, chunk }
        });
      }

      // Update the bot reply with the final response and current timestamp
      //botReply.content = finalResponse;
      botReply.timestamp = Date.now();

    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error state, such as displaying a message to the user
    } finally {
      // Update the chat history with the final bot reply
      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });
      console.log('chatHistory');
      console.log(chatHistory);
      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };

  useEffect(() => {
    // This code runs after `state` has been updated
    localStorage.setItem('chats', JSON.stringify(chats));
    console.log('State after update:', chats);
    setChats(chats);
    //setChats(state.chats);
    // Perform any other action after state update
  }, [chats]); // This will only re-run if `state` changes



  return (
    <div className="chat-container">
      <ChatHistory chatHistory={chats[selectedChatIndex].chatHistory} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      <span>TulpaTalk may not always be accurate, it's essential to double-check information.</span>
    </div>

  );
});

export default React.memo(Chat);
