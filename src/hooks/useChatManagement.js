// useChatManagement.js
import { useState } from 'react';

export default function useChatManagement(initialChats) {
  const [chats, setChats] = useState(initialChats);
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);

  const handleAddChat = (newChat) => {
    setChats([...chats, newChat]);
    setSelectedChatIndex(chats.length);
  };

  const handleDeleteChat = (chatIndex) => {
    if (chats.length > 1) {
      const updatedChats = chats.filter((_, index) => index !== chatIndex);
      setChats(updatedChats);

      if (chatIndex === selectedChatIndex) {
        setSelectedChatIndex(Math.max(0, chatIndex - 1));
      } else if (chatIndex < selectedChatIndex) {
        setSelectedChatIndex(selectedChatIndex - 1);
      }
    } else {
      alert("You must have at least one chat.");
    }
  };

  return {
    chats,
    setChats,
    selectedChatIndex,
    setSelectedChatIndex,
    handleAddChat,
    handleDeleteChat
  };
}
