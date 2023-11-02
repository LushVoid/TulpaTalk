import React, { useLayoutEffect, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function transformCodeInput(text) {
  if (typeof text !== 'string') {
    if (text === undefined) {
      console.warn('Received undefined as input for transformCodeInput');
      return '';
    }
    console.error('Expected a string as input for transformCodeInput:', text);
    return '';
  }
  const codeRegex = /code\('(.+?)'\)/g;
  return text.replace(codeRegex, '```$1```');
}


function ChatHistory({ chatHistory, isLoading, updateChatHistory }) {
  const chatBoxRef = useRef(null);
  const previousMessageIds = useRef(chatHistory.map(message => message.timestamp));
  const intervalIdRef = useRef(null);

  const handleCopyClick = (text) => {
    navigator.clipboard.writeText(text);
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    const hasNewMessage = chatHistory.length > previousMessageIds.current.length;
    const hasUpdatedMessage = chatHistory.some((message, index) => {
      return message.timestamp !== previousMessageIds.current[index];
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    // Update the previousMessageIds ref for the next render
    previousMessageIds.current = chatHistory.map(message => message.timestamp);
  }, [chatHistory]);

  useEffect(() => {
    if (isLoading && intervalIdRef.current === null) {
      intervalIdRef.current = setInterval(scrollToBottom, 6000);
    } else if (!isLoading && intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isLoading]);


  return (
    <div ref={chatBoxRef} className="chat-box">
      <div className="invisible-element" />
      {chatHistory.map((message) => (
        <div key={message.timestamp} className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
          <div className="message-actions">
            <ContentCopyIcon className="copy-button-2" onClick={() => handleCopyClick(message.content)} style={{ cursor: 'pointer' }} />
          </div>
          <div className="message-content">
            <ReactMarkdown
              components={{
                code: CodeBlock,
              }}
            >
              {transformCodeInput(message.content)}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {isLoading && <div className="message typing">
          <span className="typing-dot">Thinking</span>
          <span className="typing-dot">.</span>
          <span className="typing-dot">.</span>
          <span className="typing-dot">.</span>
        </div>}
    </div>
  );
}

export default ChatHistory;
