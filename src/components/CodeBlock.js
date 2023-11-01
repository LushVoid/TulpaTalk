import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import '../App.css';

export function CodeBlock({ node, inline, className, children, ...props }) {
  const code = inline ? children : node.children[0].value;
  const language = className ? className.replace('language-', '') : null;
  const [isClicked, setIsClicked] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1000); // Reset after 1.5 seconds
  };

  return (
    <div className="code-block-container">
      <button
        onClick={copyToClipboard}
        className={`copy-button ${isClicked ? 'clicked' : ''}`}
      >
        <ContentCopyIcon fontSize="medium" />
        {isClicked && <p>Copied!</p>}
      </button>
      <SyntaxHighlighter
        language={language}
        className="code-block"
        customStyle={{}}
      >
        {String(code).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
