import React, { forwardRef } from 'react';
import Chat from './Chat';

const ChatSection = forwardRef(({ systemSettings, selectedChat, isHidden }, ref) => (
  <div className={`chat-section ${isHidden ? 'hidden' : ''}`}>
    <Chat
      ref={ref}
      systemSettings={systemSettings}
      selectedChat={selectedChat}
      chatHistory={selectedChat?.chatHistory}
      setChatHistory={(newChatHistory) => {
        const updatedChat = { ...selectedChat, chatHistory: newChatHistory };
        // Call setChats here to update the chat in the chats array
      }}
    />
  </div>
));

export default ChatSection;
