import { useState } from 'react';

export default function usePersonaManagement(chats, setChats, selectedChatIndex) {
    const [showSettings, setShowSettings] = useState(false);

    const handleChangePersona = () => setShowSettings(!showSettings);

    const handlePersonaChange = (updatedPersona) => {
        const updatedChats = [...chats];
        updatedChats[selectedChatIndex].persona = updatedPersona;
        setChats(updatedChats);
    };

    const handleSaveSettings = () => setShowSettings(false);

    return { showSettings, handleChangePersona, handlePersonaChange, handleSaveSettings };
}
