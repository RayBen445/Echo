import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Firebase Cloud Functions API calls
export const firebaseAPI = {
  // Health check
  healthCheck: async () => {
    const healthCheck = httpsCallable(functions, 'healthCheck');
    return await healthCheck();
  },

  // User profile functions
  createUserProfile: async (userData) => {
    const createUserProfile = httpsCallable(functions, 'createUserProfile');
    return await createUserProfile(userData);
  },

  updateUserStatus: async (statusData) => {
    const updateUserStatus = httpsCallable(functions, 'updateUserStatus');
    return await updateUserStatus(statusData);
  },

  // Chat functions
  createChat: async (chatData) => {
    const createChat = httpsCallable(functions, 'createChat');
    return await createChat(chatData);
  },

  // Contact functions
  sendContactRequest: async (targetUserId) => {
    const sendContactRequest = httpsCallable(functions, 'sendContactRequest');
    return await sendContactRequest({ targetUserId });
  },

  acceptContactRequest: async (requesterId) => {
    const acceptContactRequest = httpsCallable(functions, 'acceptContactRequest');
    return await acceptContactRequest({ requesterId });
  },

  // Status functions
  deleteExpiredStatuses: async () => {
    const deleteExpiredStatuses = httpsCallable(functions, 'deleteExpiredStatuses');
    return await deleteExpiredStatuses();
  },

  // Typing indicators
  updateTypingStatus: async (chatId, isTyping) => {
    const updateTypingStatus = httpsCallable(functions, 'updateTypingStatus');
    return await updateTypingStatus({ chatId, isTyping });
  },

  cleanupTypingIndicators: async () => {
    const cleanupTypingIndicators = httpsCallable(functions, 'cleanupTypingIndicators');
    return await cleanupTypingIndicators();
  }
};

// Firebase Firestore direct operations
export { db, auth, storage, functions } from '../config/firebase';

export default firebaseAPI;