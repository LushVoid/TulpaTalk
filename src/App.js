import React, { useState, useRef, useEffect, useMemo, useReducer, } from 'react';
import Chat from './components/chat/Chat';
import ChatSidebar from './components/sidebars/SideBar';
import RightSidebar from './components/sidebars/RightSidebar'; // Import the new component
import { chatReducer } from './components/chat/chatReducer'; // Import chatReducer
import './App.css';
import tq from './modelfiles/persona';
import useChat from './hooks/useChat';
import PsychologyIcon from '@mui/icons-material/Psychology'; // This represents the brain icon


function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { chats, setChats, selectedChatIndex, setSelectedChatIndex, saveChats, saveSelectedChatIndex } = useChat();
  const [showChat, setShowChat] = useState(true);
  const chatRef = useRef();
  const [models, setModels] = useState([]);
  const defaultState = {
    chats: chats,
    selectedChatIndex: selectedChatIndex,
    isLoading: false,
  };
  const [state, dispatch] = useReducer(chatReducer, defaultState);
  const selectedChat = chats[selectedChatIndex] || {};
  const [showDataFetcher, setShowDataFetcher] = useState(false);
  const [isEegEnabled, setIsEegEnabled] = useState(false);

  console.log('rendered app');


  const handleChangePersona = () => setShowSettings(!showSettings);
  const handlePersonaChange = (updatedPersona) => {
    const updatedChats = [...chats];
    updatedChats[selectedChatIndex].persona = updatedPersona;
    state.chats = updatedChats;
    setChats(updatedChats);
  };

  const toggleChatVisibility = () => {
    setShowChat(!showChat);
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
        const modelNames = data.models.map(model => model.name);
        setModels(modelNames); // Update models state with just the names, without ':latest'
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

  const handleAddChat = () => {
    const currentChat = chats[selectedChatIndex];
    console.log('adding chat');

    const newChat = {
      ...currentChat,
      name:'New Chat',
      chatHistory:[],
    };
    const updatedChats = [...chats, newChat];
    console.log(updatedChats);
    setChats(updatedChats);
    state.chats = updatedChats;
    setSelectedChatIndex(updatedChats.length - 1); // Uncomment this if you want the new chat to be selected immediately after adding
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

  useEffect(() => {
    fetchLocalModels();
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []); // Load chats from local storage on mount

  useEffect(() => {
    const savedEegState = localStorage.getItem('eegEnabled');
    if (savedEegState !== null) {
      setIsEegEnabled(JSON.parse(savedEegState));
      }
    }, []);

    useEffect(() => {
      localStorage.setItem('eegEnabled', JSON.stringify(isEegEnabled));
    }, [isEegEnabled]);

    const toggleEegFeature = () => {
      setIsEegEnabled(!isEegEnabled);
    };

  return (
    <div className="App">
      <main className="App-content">
        <ChatSidebar
          chats={chats}
          onSelectChat={setSelectedChatIndex}
          onAddChat={handleAddChat}
          onDeleteChat={handleDeleteChat}
          selectedChatIndex={selectedChatIndex}
          setChats={setChats}
        />
        <div className={`chat-section ${!showChat ? 'hidden' : ''}`}>
          <Chat
            ref={chatRef}
            selectedChatIndex={selectedChatIndex}
            chats={state.chats}
            isLoading={state.isLoading}
            dispatch={dispatch}
            saveChats={saveChats}
            setChats={setChats}
            eEG={isEegEnabled}
          />
        </div>
        <RightSidebar
          setShowChat={setShowChat}
          showChat={showChat}
          showDataFetcher={showDataFetcher}
          setShowDataFetcher={setShowDataFetcher}
          isEegEnabled={isEegEnabled}
          showSettings={showSettings}
          persona={selectedChat.persona}
          models={models}
          onChangePersonaSettings={handlePersonaChange}
          onSubmitPersonaSettings={handleSaveSettings}
          fetchModels={fetchLocalModels}
        />
      </main>
    </div>
  );
}

export default App;
