
export const chatReducer = (state, action) => {
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
