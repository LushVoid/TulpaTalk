import React, { useState } from 'react';
import Neurofeedback from '../../addons/NF/Neurofeedback';
import PersonaSettings from './PersonaSettings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import IconButton from '@mui/material/IconButton';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CloseIcon from '@mui/icons-material/Close';  // Import CloseIcon

const RightSidebar = ({
  isEegEnabled,
  persona,
  models,
  onChangePersonaSettings,
  onSubmitPersonaSettings,
  setShowChat,
  showChat,
  fetchModels
}) => {
  const [activeComponentIndex, setActiveComponentIndex] = useState(null);

  const components = [
    {
      id: 'eeg',
      component: <Neurofeedback config={{ url: "http://localhost:5000/api/fetch-data", fetchInterval: 500 }} />
    },
    {
      id: 'personaSettings',
      component: (
        <PersonaSettings
          persona={persona}
          models={models}
          onChange={onChangePersonaSettings}
          onSubmit={onSubmitPersonaSettings}
          updateModels={fetchModels}
        />
      )
    },
    // Add more components here with unique ids
  ];

  const handleComponentClick = (index) => {
    setShowChat(false);
    setActiveComponentIndex(index);
  };

  const resetActiveComponent = () => {
    setShowChat(true);
    setActiveComponentIndex(null);
  };

  const renderActiveComponent = () => {
    const activeComponent = components.find(c => c.id === activeComponentIndex);
    return activeComponent ? activeComponent.component : null;
  };


  return (
    <div className="right-sidebar">
      <div className="right-button-container">
        {activeComponentIndex ? (
          <div className="icon-container" onClick={resetActiveComponent}>
            <CloseIcon />
            <span>Close</span>
          </div>
        ) : (
          <>
            <div className='icon-container' onClick={() => handleComponentClick('personaSettings')}>
              <div className="brain-icon">
                <AccountBoxIcon />
              </div>
              <span>Tulpa</span>
            </div>
            <span id='addontxt'>Add-Ons</span>
            <div className='icon-container' onClick={() => handleComponentClick('eeg')}>
              <div className="brain-icon">
                <PsychologyIcon />
              </div>
              <span>Neuro</span>
            </div>
          </>
        )}
      </div>
      {renderActiveComponent()}
    </div>
  );
};

export default RightSidebar;
