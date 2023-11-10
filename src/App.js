import React, { useState, useRef, useEffect, useMemo, useReducer, } from 'react';
import Chat from './components/Chat';
import ChatControlButtons from './components/ChatControlButtons';
import PersonaSettings from './components/PersonaSettings';
import ChatSidebar from './components/SideBar';
import './App.css';
import Logo from './imgs/QuillBot.png';
import tq from './persona';
import useChat from './hooks/useChat';

async function showInfo(modelName) {
  try {
    const response = await fetch('http://localhost:11434/api/show', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result); // Or whatever you need to do with the result
  } catch (error) {
    console.error('Failed to show model info:', error);
  }
}

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SEND_USER_MESSAGE':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex
            ? {
                ...chat,
                chatHistory: [...(chat.chatHistory || []), action.payload.userMessage, action.payload.botReply],
              }
            : chat
        ),
        isLoading: true,
      };
    case 'UPDATE_BOT_REPLY':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex
            ? {
                ...chat,
                chatHistory: (chat.chatHistory || []).map((message) =>
                  message.role === (state.chats[state.selectedChatIndex].persona?.name || '') && message.timestamp === action.payload.timestamp
                    ? { ...message, content: action.payload.botReplyText }
                    : message
                ),
              }
            : chat
        ),
        isLoading: action.payload.isBotTyping,
      };
    case 'SET_LOADING_STATE':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex ? { ...chat, chatHistory: [] } : chat
        ),
      };
    case 'SET_SELECTED_CHAT_INDEX':
      return {
        ...state,
        selectedChatIndex: action.payload,
      };
    case 'UPDATE_CHAT_HISTORY':
      return {
        ...state,
        chats: state.chats.map((chat, index) =>
          index === state.selectedChatIndex ? { ...chat, chatHistory: action.payload } : chat
        ),
      };
    case 'UPDATE_CHATS':
      return {
        ...state,
        chats: action.payload,
      };
    case 'RENAME_CHAT':
      // Clone the chats array
      const newChats = [...state.chats];
      // Update the chat's name using the provided index
      if (newChats[action.payload.index]) {
        newChats[action.payload.index].name = action.payload.newName;
      }
      return { ...state, chats: newChats };


      case 'UPDATE_PARTIAL_BOT_REPLY':
    return {
      ...state,
      chats: state.chats.map((chat, index) =>
        index === state.selectedChatIndex
          ? {
              ...chat,
              chatHistory: chat.chatHistory.map((message) =>
                message.timestamp === action.payload.timestamp
                  ? { ...message, content: message.content + action.payload.chunk }
                  : message
              ),
            }
          : chat
      ),
    };


    default:
      return state;
  }
};

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { chats, setChats, selectedChatIndex, setSelectedChatIndex, saveChats, saveSelectedChatIndex } = useChat();
  const chatRef = useRef();
  const [models, setModels] = useState([]);
  const defaultState = {
    chats: chats,
    selectedChatIndex: selectedChatIndex,
    isLoading: false,
  };
  const [state, dispatch] = useReducer(chatReducer, defaultState);




  console.log('rendered app');

  const selectedChat = chats[selectedChatIndex] || {};

  const handleChangePersona = () => setShowSettings(!showSettings);
  const handlePersonaChange = (updatedPersona) => {
    const updatedChats = [...chats];
    updatedChats[selectedChatIndex].persona = updatedPersona;
    state.chats = updatedChats;
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
        const modelNames = data.models.map(model => model.name.split(':latest')[0]);
        setModels(modelNames); // Update models state with just the names, without ':latest'
        const latestModel = data.models[data.models.length - 1];
        updateDefaultPersonaModel(latestModel.name);

        // Iterate through each model name and call showInfo for each
        for (const modelName of modelNames) {
          await showInfo(modelName);
        }
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




  return (
    <div className="App">
    <header className={`App-header ${showSettings ? 'hidden' : ''}`}>
      <img src={Logo} alt="TokenQuill Logo" className="logo" />
      <h1>{selectedChat.persona?.model}</h1>

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
          selectedChatIndex={selectedChatIndex}
          chats={state.chats}
          isLoading={state.isLoading}
          dispatch={dispatch}
          saveChats={saveChats}
          setChats={setChats}
          />
        </div>
        {showSettings && <PersonaSettings persona={selectedChat.persona} models={models} onChange={handlePersonaChange} onSubmit={handleSaveSettings} updateModels={fetchLocalModels}/>}
      </main>
    </div>
  );
}

export default App;
