import React, { useEffect, useRef, useReducer, forwardRef, useImperativeHandle, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { fetchBotReply } from './hooks';


const defaultState = {
  chats: JSON.parse(localStorage.getItem('chats')) || [],
  selectedChatIndex: 0,
  isLoading: false,
};

const chatReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SEND_USER_MESSAGE':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex
            ? {
                ...chat,
                chatHistory: [...(chat.chatHistory || []), action.payload.userMessage, action.payload.botReply],
              }
            : chat
        ),
        isLoading: true,
      };
    case 'UPDATE_BOT_REPLY':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex
            ? {
                ...chat,
                chatHistory: (chat.chatHistory || []).map((message) =>
                  message.role === (state.chats[state.selectedChatIndex].persona?.name || '') && message.timestamp === action.payload.timestamp
                    ? { ...message, content: action.payload.botReplyText }
                    : message
                ),
              }
            : chat
        ),
        isLoading: action.payload.isBotTyping,
      };
    case 'SET_LOADING_STATE':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex ? { ...chat, chatHistory: [] } : chat
        ),
      };
    case 'SET_SELECTED_CHAT_INDEX':
      return {
        ...state,
        selectedChatIndex: action.payload,
      };
    case 'UPDATE_CHAT_HISTORY':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex ? { ...chat, chatHistory: action.payload } : chat
        ),
      };
    case 'UPDATE_CHATS':
      return {
        ...state,
        chats: action.payload,
      };

    default:
      return state;
  }
};

const Chat = forwardRef(({ systemSettings, selectedChatIndex, chats, setChats }, ref) => {
  const [state, dispatch] = useReducer(chatReducer, defaultState);


  const messageEndRef = useRef(null);

  // Guard against undefined selectedChat
  const selectedChat = state.chats[state.selectedChatIndex] || {};

  useImperativeHandle(ref, () => ({
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
  }));

  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_CHAT_INDEX', payload: selectedChatIndex });
  }, [selectedChatIndex, state.chats]);

  useEffect(() => {
    if (selectedChat.chatHistory) {
      scrollToBottom();
    }
  }, [selectedChat.chatHistory]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_CHATS', payload: chats });
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

    const timestamp = Date.now();
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: timestamp,
    };

    const persona = selectedChat.persona;
    const botReplyPlaceholder = {
      role: persona?.name || 'bot',
      content: '',
      timestamp: timestamp + 1,
    };

    // Update the chat history immediately with the user's message and a placeholder for the bot's reply
    const updatedChatHistory = [...(selectedChat.chatHistory || []), newUserMessage, botReplyPlaceholder];
    dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: updatedChatHistory });

    const selectpersona = selectedChat.persona;
    console.log("Selected Chat:", state.chats[state.selectedChatIndex]);
    console.log("Index:", state.selectedChatIndex);
    console.log("Index:", state.chats);
    console.log("Persona:", state.chats[state.selectedChatIndex].persona);



    try {
      // Fetch the bot's reply based on the updated chat history
      const actualBotReply = await fetchBotReply(
        botReplyPlaceholder.timestamp,
        updatedChatHistory,
        updateBotReply,
        selectpersona,
        dispatch
      );

      if (actualBotReply) {
        // Update the chat history again with the actual bot's reply
        const finalUpdatedChatHistory = [...updatedChatHistory, actualBotReply];
        dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: finalUpdatedChatHistory });
      }
    } catch (error) {
      console.error('Error fetching bot reply:', error);
    }
  };



  const updateBotReply = useCallback((timestamp, botReplyText, isBotTyping) => {
    dispatch({ type: 'UPDATE_BOT_REPLY', payload: { timestamp, botReplyText, isBotTyping } });
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(state.chats));
  }, [state.chats]);

  const handleUpdateChatHistory = (updatedHistory) => {
    dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: updatedHistory });
  };


  return (
    <div className="chat-container">
      <ChatHistory chatHistory={selectedChat.chatHistory || []} isLoading={state.isLoading} updateChatHistory={handleUpdateChatHistory} />
      <ChatInput onSendMessage={sendMessage} isLoading={state.isLoading} />
    </div>

  );
});

export default React.memo(Chat);
