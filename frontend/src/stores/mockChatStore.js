import { create } from 'zustand';

// Mock chat data
const mockChats = [
  {
    id: 'chat-1',
    type: 'direct',
    participants: ['mock-user-123', 'user-2'],
    participantNames: ['John Doe', 'Unknown'],
    lastMessage: {
      id: 'msg-1',
      content: 'Hey! How are you doing?',
      senderId: 'user-2',
      senderName: 'Unknown',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      type: 'text'
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 1
  },
  {
    id: 'chat-2',
    type: 'group',
    name: 'Family Group',
    participants: ['mock-user-123', 'user-2', 'user-3'],
    participantNames: ['John Doe', 'Sarah', 'Mike'],
    lastMessage: {
      id: 'msg-2',
      content: 'See you at dinner!',
      senderId: 'user-2',
      senderName: 'Sarah',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      type: 'text'
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unreadCount: 0
  },
  {
    id: 'chat-3',
    type: 'direct',
    participants: ['mock-user-123', 'user-4'],
    participantNames: ['John Doe', 'Unknown'],
    lastMessage: {
      id: 'msg-3',
      content: 'Thanks for the help today!',
      senderId: 'mock-user-123',
      senderName: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      type: 'text'
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    unreadCount: 0
  }
];

const mockMessages = {
  'chat-1': [
    {
      id: 'msg-1-1',
      content: 'Hey! How are you doing?',
      senderId: 'user-2',
      senderName: 'Unknown',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: 'text',
      reactions: {},
      readBy: []
    },
    {
      id: 'msg-1-2',
      content: 'I\'m good, thanks for asking!',
      senderId: 'mock-user-123',
      senderName: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      type: 'text',
      reactions: {},
      readBy: []
    }
  ]
};

const useChatStore = create((set, get) => ({
  // State
  chats: mockChats,
  activeChat: null,
  messages: mockMessages,
  typingUsers: {},
  isLoading: false,
  
  // Unsubscribe functions (mock)
  unsubscribeChats: null,
  unsubscribeMessages: {},
  unsubscribeTyping: {},

  // Actions
  loadUserChats: async (userId) => {
    set({ isLoading: true });
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      chats: mockChats,
      isLoading: false 
    });
  },

  setActiveChat: (chatId) => {
    const chat = mockChats.find(c => c.id === chatId);
    set({ activeChat: chat });
  },

  sendMessage: async (chatId, message) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: message.content,
      senderId: 'mock-user-123',
      senderName: 'John Doe',
      timestamp: new Date().toISOString(),
      type: message.type || 'text',
      reactions: {},
      readBy: []
    };

    // Add message to store
    const { messages } = get();
    const chatMessages = messages[chatId] || [];
    set({
      messages: {
        ...messages,
        [chatId]: [...chatMessages, newMessage]
      }
    });

    return newMessage;
  },

  addReaction: async (chatId, messageId, emoji) => {
    // Mock reaction functionality
    console.log('Added reaction:', { chatId, messageId, emoji });
  },

  replyToMessage: async (chatId, originalMessageId, replyContent) => {
    // Mock reply functionality
    console.log('Replied to message:', { chatId, originalMessageId, replyContent });
  },

  createChat: async (participantId, type = 'direct') => {
    // Mock chat creation
    const newChat = {
      id: `chat-${Date.now()}`,
      type,
      participants: ['mock-user-123', participantId],
      participantNames: ['John Doe', 'Unknown'],
      lastMessage: null,
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    };

    set(state => ({
      chats: [...state.chats, newChat]
    }));

    return newChat;
  },

  cleanup: () => {
    // Mock cleanup
    console.log('Chat store cleanup');
  }
}));

export default useChatStore;