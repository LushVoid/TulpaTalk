import { useState } from 'react';
import useFetchModels from './useFetchModels';
import usePersonaManagement from './usePersonaManagement';
import useChatManagement from './useChatManagement';

export default function useAppManagement() {
    const [showSettings, setShowSettings] = useState(false);
    const { models, error } = useFetchModels();
    const { chats, selectedChat, ...chatHandlers } = useChatManagement();
    const { handlePersonaChange, handleChangePersona, handleSaveSettings } = usePersonaManagement(chats, chatHandlers.setChats, chatHandlers.selectedChatIndex);

    return {
        chats,
        selectedChat,
        showSettings,
        models,
        error,
        ...chatHandlers,
        handlePersonaChange,
        handleChangePersona,
        handleSaveSettings,
    };
}
