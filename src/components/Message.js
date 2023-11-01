import React from 'react';

function Message({ text, sender }) {
  return (
    <div className={`Message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}

export default Message;
