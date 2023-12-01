import React, { useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';

function ChatSidebar({ chats, onSelectChat, onAddChat, onDeleteChat, selectedChatIndex, setChats }) {
  const [hoverStatus, setHoverStatus] = useState('');
  const [editingIndex, setEditingIndex] = useState(null); // Added this line
  const [editedName, setEditedName] = useState(''); // And this line
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chats));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "chats.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleEditChatName = (index) => {
    setEditingIndex(index);
    setEditedName(chats[index].name);
  };

  const handleChangeChatName = (e) => {
    setEditedName(e.target.value);
  };

  const handleBlurChatName = () => {
    if (editedName && editedName !== chats[editingIndex].name) {
      const updatedChats = [...chats];
      updatedChats[editingIndex].name = editedName;
      setChats(updatedChats);
    }
    setEditingIndex(null);
  };

  const handleKeyPressOnChatName = (e) => {
    if (e.key === 'Enter') {
      handleBlurChatName();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedChats = JSON.parse(e.target.result);
          setChats(importedChats);
        } catch (error) {
          console.error("Error parsing the file", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-actions">
          <button
            onMouseEnter={() => setHoverStatus('import')}
            onMouseLeave={() => setHoverStatus('')}
            onClick={handleImport}
            className="import-export-button"
          >
            <ImportExportIcon />
          </button>
          <button
            onMouseEnter={() => setHoverStatus('export')}
            onMouseLeave={() => setHoverStatus('')}
            onClick={handleExport}
            className="import-export-button"
          >
            <SaveAltIcon />
          </button>
          <h3>
            {hoverStatus === 'import' ? 'Import' : hoverStatus === 'export' ? 'Export' : hoverStatus === 'add' ? 'New Talk' :'Talks'}
          </h3>
        </div>
      </div>
      <button onClick={onAddChat} className="add-chat-button" onMouseEnter={() => setHoverStatus('add')}
      onMouseLeave={() => setHoverStatus('')}><AddIcon /></button>
      <ul>
        {chats.map((chat, index) => (

          <li
            key={index}
            onClick={() => onSelectChat(index)}
            className={selectedChatIndex === index ? 'selected-chat' : ''}
          >
          <div id="chaticon"><button
            onClick={(e) => { e.stopPropagation(); onDeleteChat(index); }}
            className="delete-chat-button"
          >
          <CloseIcon />
          </button><ChatIcon /></div>
            {editingIndex === index ? (
              <input
                type="text"
                value={editedName}
                onChange={handleChangeChatName}
                onBlur={handleBlurChatName}
                onKeyPress={handleKeyPressOnChatName}
                autoFocus
              />
            ) : (
              <div className="chatnamesCont">
              <span id="chatnames" onDoubleClick={() => handleEditChatName(index)}>{chat.name} </span></div>
            )}

          </li>
        ))}
      </ul>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ChatSidebar;
