import React, { useState, useRef, useCallback, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Custom hook for managing textarea
function useTextarea() {
  const textareaRef = useRef(null);

  const resizeTextarea = (value) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    return value.length <= 67; // derived state for showing buttons
  };

  return { textareaRef, resizeTextarea };
}

// Custom hook for speech recognition
function useSpeech(timeoutDuration = 3000) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [timeoutId, setTimeoutId] = useState(null);

  // Function to toggle listening
  const toggleListening = useCallback(() => {
    if (!listening) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  }, [listening, timeoutId]);

  // Restart timeout when transcript changes
  useEffect(() => {
    if (transcript) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const id = setTimeout(() => {
        SpeechRecognition.stopListening();
      }, timeoutDuration);
      setTimeoutId(id);
    }
  }, [transcript, timeoutId, timeoutDuration]);

  return { transcript, listening, resetTranscript, toggleListening };
}

const ChatInput = React.memo(function ChatInput({ onSendMessage, isLoading }) {
  const { textareaRef, resizeTextarea } = useTextarea();
  const { transcript, listening, resetTranscript, toggleListening } = useSpeech();

  const [showButtons, setShowButtons] = useState(true);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSendMessage(textareaRef.current.value);
        textareaRef.current.value = '';
        setShowButtons(true); // Reset button visibility
      }
    }
  }, [onSendMessage, isLoading]);

  const handleInput = useCallback((event) => {
    const show = resizeTextarea(event.target.value);
    setShowButtons(show);
  }, []);

  const handleSendClick = () => {
    if (!isLoading) {
      onSendMessage(textareaRef.current.value);
      textareaRef.current.value = '';
      setShowButtons(true); // Reset button visibility
    }
  };

  useEffect(() => {
    if (transcript) {
      textareaRef.current.value = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    if (transcript && !listening) {
      onSendMessage(transcript);
      resetTranscript();
      textareaRef.current.value = '';
      setShowButtons(true); // Reset button visibility
    }
  }, [transcript, listening, onSendMessage, resetTranscript]);

  useEffect(() => {
    if (!isLoading) {
      setShowButtons(true);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'initial';
      }
    }
  }, [isLoading]);

  return (
    <div className="input-container">
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          id="ChatInput"
          onKeyPress={handleKeyPress}
          onInput={handleInput}
        />
        <div className="buttons-container">
          {!isLoading && showButtons && (
            <button
              id='send'
              onClick={handleSendClick}
              style={{ display: listening ? 'none' : 'inline-block' }}
            >
              <SendIcon />
            </button>
          )}
          {!isLoading && (listening || showButtons) && (
            <button
              id='mic'
              onClick={toggleListening}
              className={listening ? "listening" : ""}
            >
              <MicIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ChatInput;
