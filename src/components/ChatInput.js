import React, { useRef, useCallback, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


const ChatInput = React.memo(function ChatInput({ onSendMessage, isLoading }) {
  const textareaRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

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
          {!isLoading && (
            <button
              id='send'
              onClick={handleSendClick}
              style={{ display: listening ? 'none' : 'inline-block' }}
            >
              <SendIcon />
            </button>
          )}
          {!isLoading && (
            <button
              id='mic'
              onClick={SpeechRecognition.startListening}
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
