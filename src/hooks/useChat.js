import { useState, useEffect, useCallback } from 'react';
import tq from '../persona';

function useChat() {
  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        return JSON.parse(savedChats);
      }
    } catch (error) {
      console.error("Failed to load chats from localStorage:", error);
    }
    return [{ name: 'New Chat', chatHistory: [], persona: tq, wpm:0, msgSpeeds:[] }];
  });

  const [selectedChatIndex, setSelectedChatIndex] = useState(() => {
    try {
      const savedIndex = localStorage.getItem('selectedChatIndex');
      if (savedIndex !== null) {
        const index = Number(savedIndex);
        if (index >= 0 && index < chats.length) {
          return index;
        }
      }
    } catch (error) {
      console.error("Failed to load selectedChatIndex from localStorage:", error);
    }
    return 0;
  });

  const saveChats = useCallback(() => {
    try {
      localStorage.setItem('chats', JSON.stringify(chats));
      console.log("Saved chats to localStorage");
    } catch (error) {
      console.error("Failed to save chats to localStorage:", error);
    }
  }, [chats]);

  const saveSelectedChatIndex = useCallback(() => {
    try {
      localStorage.setItem('selectedChatIndex', selectedChatIndex.toString());
      console.log("Saved selectedChatIndex to localStorage:", selectedChatIndex);
    } catch (error) {
      console.error("Failed to save selectedChatIndex to localStorage:", error);
    }
  }, [selectedChatIndex]);

  useEffect(() => {
    saveChats();
  }, [chats, saveChats]);

  useEffect(() => {
    saveSelectedChatIndex();
  }, [selectedChatIndex, saveSelectedChatIndex]);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);


  return { chats, setChats, selectedChatIndex, setSelectedChatIndex, saveChats, saveSelectedChatIndex };
}

export default useChat;
