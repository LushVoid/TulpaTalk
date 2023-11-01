// AppHeaderundefinedjs
import React from 'react';
import Logo from './imgs/QuillBot.png';
import ChatControlButtons from './components/ChatControlButtons';

export default function AppHeader({ personaName, onPersonaClick }) {
  return (
    <header className="App-header">
      <img src={Logo} alt="TokenQuill Logo" className="logo" />
      <h1>{personaName}</h1>
      <ChatControlButtons onPersonaClick={onPersonaClick} />
    </header>
  );
}
