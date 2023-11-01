// ChatControlButtons.js
import React from 'react';
import ButtonBox from './ButtonBox';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ChatControlButtons = ({ onPersonaClick, }) => (
  <>
    <ButtonBox
      icon={<AccountBoxIcon />}
      text="Persona"
      onClick={onPersonaClick}
      className="persona-button-box"
    />
  </>
);

export default ChatControlButtons;
