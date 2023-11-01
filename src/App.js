import React, { useState, useRef, useEffect, useMemo } from 'react';
import Chat from './components/Chat';
import ChatControlButtons from './components/ChatControlButtons';
import PersonaSettings from './components/PersonaSettings';
import ChatSidebar from './components/SideBar';
import './App.css';
import Logo from './imgs/QuillBot.png';
import tq from './persona';
import useChat from './hooks/useChat';


function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { chats, setChats, selectedChatIndex, setSelectedChatIndex } = useChat();
  const chatRef = useRef();
  const [models, setModels] = useState([]);

  console.log('rendered app');

  const selectedChat = chats[selectedChatIndex] || {};

  const handleChangePersona = () => setShowSettings(!showSettings);
  const handlePersonaChange = (updatedPersona) => {
    const updatedChats = [...chats];
    updatedChats[selectedChatIndex].persona = updatedPersona;
    setChats(updatedChats);
  };
  const handleSaveSettings = () => setShowSettings(false);

  const fetchLocalModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Local Models:', data.models);
      if (data.models && data.models.length > 0) {
        setModels(data.models.map(model => model.name.split(':latest')[0]));  // Update models state
        const latestModel = data.models[data.models.length - 1];
        updateDefaultPersonaModel(latestModel.name);
      }
    } catch (error) {
      console.error('Failed to fetch local models:', error);
    }
  };

  const updateDefaultPersonaModel = (modelName) => {
    const updatedChats = [...chats];
    const defaultPersona = updatedChats[0]?.persona;

    if (defaultPersona) {
      const [modelNameWithoutSuffix] = modelName.split(':latest');
      defaultPersona.model = modelNameWithoutSuffix;
      setChats(updatedChats);
      console.log('Default persona model updated to:', modelNameWithoutSuffix);
    }
  };

  useEffect(() => {
    fetchLocalModels();
  }, []); // Empty dependency array means this effect will only run once after the initial render

  const handleAddChat = () => {
    setChats((prevChats) => {
      const currentChat = chats[selectedChatIndex];
      console.log('adding chat');
      console.log(chats);
      console.log('aaaaaaaaaaaaaaaaaa');
      const newChat = {
        ...currentChat, // Copy all properties from the current chat
        chatHistory: [], // Set an empty chat history
        name: 'New Chat' // Set a new name (optional)
      };

      const updatedChats = [...prevChats, newChat];
      setSelectedChatIndex(updatedChats.length - 1);
      return updatedChats;
    });
  };


  const handleDeleteChat = (chatIndex) => {
    if (chats.length > 1) {
      const updatedChats = chats.filter((_, index) => index !== chatIndex);
      setChats(updatedChats);

      if (chatIndex === selectedChatIndex) {
        setSelectedChatIndex(Math.max(0, chatIndex - 1));
      } else if (chatIndex < selectedChatIndex) {
        setSelectedChatIndex(selectedChatIndex - 1);
      }
    } else {
      alert("You must have at least one chat.");
    }
  };


  const handleUpdateChatHistory = (chatIndex, newMessage) => {
    if (chatIndex >= 0 && chatIndex < chats.length) {
      setChats(chats => {
        const updatedChats = [...chats];
        const chatToUpdate = updatedChats[chatIndex];
        if (chatToUpdate) {
          chatToUpdate.chatHistory = [...chatToUpdate.chatHistory, newMessage];
        } else {
          console.error('Chat to update not found');
        }
        return updatedChats;
      });
      console.log('Chat history updated');
    } else {
      console.error('Invalid chat index');
    }
  };

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []); // Load chats from local storage on mount

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]); // Save chats to local storage on change


  return (
    <div className="App">
    <header className={`App-header ${showSettings ? 'hidden' : ''}`}>
      <img src={Logo} alt="TokenQuill Logo" className="logo" />
      <h1>{selectedChat.persona?.name}</h1>
      <t>🧠: {selectedChat.persona?.model}</t>

    </header>
      <ChatControlButtons onPersonaClick={handleChangePersona} />
      <main className="App-content">
        <ChatSidebar
        chats={chats}
        onSelectChat={setSelectedChatIndex}
        onAddChat={handleAddChat}
        onDeleteChat={handleDeleteChat}
        selectedChatIndex={selectedChatIndex}
        setChats={setChats}
        />
        <div className={`chat-section ${showSettings ? 'hidden' : ''}`}>
        <Chat
          ref={chatRef}
          systemSettings={selectedChat.persona}
          selectedChatIndex={selectedChatIndex}
          chats={chats}
          setChats={setChats}
          updateChatHistory={handleUpdateChatHistory}
          />
        </div>
        {showSettings && <PersonaSettings persona={selectedChat.persona} models={models} onChange={handlePersonaChange} onSubmit={handleSaveSettings} />}
      </main>
    </div>
  );
}

export default App;
