import React, { useEffect } from 'react';

const TextToSpeech = ({ textToSpeak }) => {
  // Function to handle text-to-speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      speechSynthesis.speak(msg);
    } else {
      alert("Sorry, your browser does not support text-to-speech!");
    }
  };

  useEffect(() => {
    if (textToSpeak) {
      console.log('speaking!!!!!!!!!!');
      speak(textToSpeak);
    }
  }, [textToSpeak]); // Dependency array: Effect runs when `textToSpeak` changes

  return (
    <div>
      <h1>Text to Speech Component</h1>
    </div>
  );
};

export default TextToSpeech;
