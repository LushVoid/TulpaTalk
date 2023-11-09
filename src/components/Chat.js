import React, {  useState, useEffect, useRef, useReducer, forwardRef, useImperativeHandle, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { fetchBotReply } from './hooks';
import { Ollama } from "langchain/llms/ollama";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";

const chatReducer = (state, action) => {
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
    case 'RENAME_CHAT':
      // Clone the chats array
      const newChats = [...state.chats];
      // Update the chat's name using the provided index
      if (newChats[action.payload.index]) {
        newChats[action.payload.index].name = action.payload.newName;
      }
      return { ...state, chats: newChats };


      case 'UPDATE_PARTIAL_BOT_REPLY':
    return {
      ...state,
      chats: state.chats.map((chat, index) =>
        index === state.selectedChatIndex
          ? {
              ...chat,
              chatHistory: chat.chatHistory.map((message) =>
                message.timestamp === action.payload.timestamp
                  ? { ...message, content: message.content + action.payload.chunk }
                  : message
              ),
            }
          : chat
      ),
    };


    default:
      return state;
  }
};

const Chat = forwardRef(({ systemSettings, selectedChatIndex, chats, setChats }, ref) => {
  const defaultState = {
    chats: JSON.parse(localStorage.getItem('chats')) || [chats[0]],
    selectedChatIndex: 0,
    isLoading: false,
  };
  const [state, dispatch] = useReducer(chatReducer, defaultState);

  const messageEndRef = useRef(null);

  // Guard against undefined selectedChat
  const selectedChat = state.chats[state.selectedChatIndex] || {};

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: selectedChat.persona.model,
  });

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

    const { persona, chatHistory = [], name } = selectedChat;
    const timestamp = Date.now();

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp,
    };

    const botReply = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(), // Set the timestamp immediately to the time message was sent
    };

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      // Add new user message and a placeholder for bot reply to chat history
      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });

      const chatHistoryJson = JSON.stringify(chatHistory);
      const promptForOllama = `<|chathistory.json|>${chatHistoryJson}</s>\n${userMessage}`;

      const stream = await ollama.stream(promptForOllama);
      let finalResponse = '';
      let bt = botReply.timestamp;

      for await (const chunk of stream) {
        botReply.content += chunk;
        dispatch({
          type: 'UPDATE_PARTIAL_BOT_REPLY',
          payload: { bt, chunk }
        });
      }

      // Update the bot reply with the final response and current timestamp
      //botReply.content = finalResponse;
      botReply.timestamp = Date.now();

      // Update the chat history with the final bot reply
      dispatch({
        type: 'UPDATE_CHAT_HISTORY',
        payload: [...chatHistory, newUserMessage, botReply]
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error state, such as displaying a message to the user
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };


  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(state.chats));
  }, [state.chats]);


  return (
    <div className="chat-container">
      <ChatHistory chatHistory={selectedChat.chatHistory} isLoading={state.isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={state.isLoading} />
      <span>TulpaTalk may not always be accurate, it's essential to double-check information.</span>
    </div>

  );
});

export default React.memo(Chat);
