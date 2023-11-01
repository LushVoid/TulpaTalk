import React from 'react';
import Chat from './Chat';
import PersonaSettings from './PersonaSettings';

export default function MainContent({ selectedChat, showSettings, models, handlePersonaChange, handleSaveSettings, selectedChatIndex, chats, setChats }) {
    return (
        <main className="App-content">
            <div className={`chat-section ${showSettings ? 'hidden' : ''}`}>
                <Chat systemSettings={selectedChat.persona} {...{ selectedChatIndex, chats, setChats }} />
            </div>
            {showSettings && <PersonaSettings persona={selectedChat.persona} models={models} onChange={handlePersonaChange} onSubmit={handleSaveSettings} />}
        </main>
    );
}
