import React, { useRef, useCallback, useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


const ChatInput = React.memo(function ChatInput({ onSendMessage, isLoading }) {
  const textareaRef = useRef(null);
  const [showButtons, setShowButtons] = useState(true); // New state variable

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [timeoutId, setTimeoutId] = useState(null);

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  useEffect(() => {
    // Restart the timeout every time the transcript changes
    if (transcript) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const id = setTimeout(() => {
        stopListening();
      }, 3000); // 3 seconds timeout after the last word
      setTimeoutId(id);
    }
  }, [transcript]);

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

    // Calculate number of characters
    const c = textarea.value.length;
    setShowButtons(c <= 67);
  }, []);

  const handleSendClick = () => {
    if (!isLoading) {
      onSendMessage(textareaRef.current.value);
      textareaRef.current.value = '';
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
    }
  }, [transcript, listening, onSendMessage, resetTranscript]);

  useEffect(() => {
    // Check if loading is finished, then show buttons
    if (!isLoading) {
      setShowButtons(true);
    }
    textareaRef.current.style.height = 'initial'; // Reset the height of the textarea
  }, [isLoading]); // Effect runs when isLoading changes

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
          {/* Show Send button based on showButtons and isLoading */}
          {!isLoading && showButtons && (
            <button
              id='send'
              onClick={handleSendClick}
              style={{ display: listening ? 'none' : 'inline-block' }}
            >
              <SendIcon />
            </button>
          )}
          {/* Always show Mic button when listening, otherwise depend on showButtons */}
          {!isLoading && (listening || showButtons) && (
            <button
              id='mic'
              onClick={startListening}
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
