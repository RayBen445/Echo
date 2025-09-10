import { create } from 'zustand';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';

const useChatStore = create((set, get) => ({
  // State
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null,
  
  // Unsubscribe functions
  unsubscribeChats: null,
  unsubscribeMessages: {},
  unsubscribeTyping: {},

  // Actions
  loadUserChats: (userId) => {
    const { unsubscribeChats } = get();
    
    // Unsubscribe from previous listener
    if (unsubscribeChats) {
      unsubscribeChats();
    }

    set({ isLoading: true, error: null });

    try {
      // Subscribe to user's chats
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        set({ 
          chats,
          isLoading: false,
          error: null,
          unsubscribeChats: unsubscribe
        });
      }, (error) => {
        console.error('Error loading chats:', error);
        
        let errorMessage = 'Failed to load chats';
        switch (error.code) {
          case 'permission-denied':
          case 'firestore/permission-denied':
            errorMessage = 'Permission denied accessing chats';
            break;
          case 'auth/insufficient-permission':
            errorMessage = 'Insufficient permissions to access chats';
            break;
        }
        
        set({ 
          isLoading: false,
          error: errorMessage
        });
      });

      set({ unsubscribeChats: unsubscribe });
    } catch (error) {
      console.error('Error setting up chat listener:', error);
      set({ 
        isLoading: false,
        error: 'Failed to load chats'
      });
    }
  },

  setActiveChat: (chatId) => {
    const { unsubscribeMessages, unsubscribeTyping, activeChat } = get();
    
    // Unsubscribe from previous message and typing listeners
    if (activeChat && unsubscribeMessages[activeChat]) {
      unsubscribeMessages[activeChat]();
      delete unsubscribeMessages[activeChat];
    }
    
    if (activeChat && unsubscribeTyping[activeChat]) {
      unsubscribeTyping[activeChat]();
      delete unsubscribeTyping[activeChat];
    }

    set({ activeChat: chatId });

    if (chatId) {
      // Subscribe to messages for this chat
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: messages
          }
        }));
      });

      // Subscribe to typing indicators
      const typingQuery = collection(db, 'chats', chatId, 'typing');
      const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
        const typingUsers = {};
        snapshot.docs.forEach(doc => {
          typingUsers[doc.data().userId] = doc.data().timestamp;
        });
        
        set(state => ({
          typingUsers: {
            ...state.typingUsers,
            [chatId]: typingUsers
          }
        }));
      });

      set(state => ({
        unsubscribeMessages: {
          ...state.unsubscribeMessages,
          [chatId]: messagesUnsubscribe
        },
        unsubscribeTyping: {
          ...state.unsubscribeTyping,
          [chatId]: typingUnsubscribe
        }
      }));
    }
  },

  sendMessage: async (chatId, messageData) => {
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Update chat's latest message
      await updateDoc(doc(db, 'chats', chatId), {
        latestMessage: messageData.content,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message';
      switch (error.code) {
        case 'permission-denied':
        case 'firestore/permission-denied':
          errorMessage = 'Permission denied sending message';
          break;
        case 'auth/insufficient-permission':
          errorMessage = 'Insufficient permissions to send message';
          break;
        case 'firestore/not-found':
          errorMessage = 'Chat not found';
          break;
      }
      
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  createChat: async (participants, chatName = '', isGroupChat = false, type = 'one_on_one') => {
    try {
      const createChatFn = httpsCallable(functions, 'createChat');
      const result = await createChatFn({
        participants,
        chatName,
        isGroupChat,
        type
      });
      
      return result.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      
      let errorMessage = 'Failed to create chat';
      switch (error.code) {
        case 'permission-denied':
        case 'functions/permission-denied':
          errorMessage = 'Permission denied creating chat';
          break;
        case 'auth/insufficient-permission':
          errorMessage = 'Insufficient permissions to create chat';
          break;
        case 'functions/unauthenticated':
          errorMessage = 'Authentication required to create chat';
          break;
      }
      
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),

  updateTypingStatus: async (chatId, isTyping) => {
    try {
      const updateTypingFn = httpsCallable(functions, 'updateTypingStatus');
      await updateTypingFn({ chatId, isTyping });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  },

  // Cleanup function
  cleanup: () => {
    const { unsubscribeChats, unsubscribeMessages, unsubscribeTyping } = get();
    
    if (unsubscribeChats) {
      unsubscribeChats();
    }
    
    Object.values(unsubscribeMessages).forEach(unsubscribe => unsubscribe());
    Object.values(unsubscribeTyping).forEach(unsubscribe => unsubscribe());
    
    set({
      chats: [],
      activeChat: null,
      messages: {},
      typingUsers: {},
      unsubscribeChats: null,
      unsubscribeMessages: {},
      unsubscribeTyping: {}
    });
  }
}));

export default useChatStore;