import React from 'react';
import IconButton from '@mui/material/IconButton';


function ButtonBox({ icon, text, onClick, className }) {
  return (
    <div className={`button-box ${className}`} onClick={onClick}>
      <IconButton color="inherit">
        {icon}
      </IconButton>
      <span>{text}</span>
    </div>
  );
}

export default ButtonBox;
