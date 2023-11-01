import React, { useRef, useCallback } from 'react';
import SendIcon from '@mui/icons-material/Send';


const ChatInput = React.memo(function ChatInput({ onSendMessage, isLoading }) {
  const textareaRef = useRef(null);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSendMessage(textareaRef.current.value);
        textareaRef.current.value = '';
      }
    }
  }, [onSendMessage, isLoading]);

  const handleInput = useCallback((event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleSendClick = () => {
    if (!isLoading) {
      onSendMessage(textareaRef.current.value);
      textareaRef.current.value = '';
    }
  };

  return (
    <div className="input-container">
      <textarea
        ref={textareaRef}
        id="ChatInput"
        onKeyPress={handleKeyPress}
        onInput={handleInput}
      />
      {!isLoading && <button id='send' onClick={handleSendClick}><SendIcon /></button>}
    </div>
  );
});

export default ChatInput;
