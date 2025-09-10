import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userData: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  // Actions
  initialize: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is signed in
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;
            
            set({
              user,
              userData,
              isLoading: false,
              isInitialized: true,
              error: null
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            
            // Handle specific Firestore errors
            let errorMessage = null;
            switch (error.code) {
              case 'permission-denied':
                errorMessage = 'Permission denied accessing user data';
                break;
              case 'firestore/permission-denied':
                errorMessage = 'Database access denied';
                break;
              case 'auth/insufficient-permission':
                errorMessage = 'Insufficient permissions';
                break;
              default:
                errorMessage = 'Failed to load user data';
            }
            
            set({
              user,
              userData: null,
              isLoading: false,
              isInitialized: true,
              error: errorMessage
            });
          }
        } else {
          // User is signed out
          set({
            user: null,
            userData: null,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        }
        
        // Resolve the promise and unsubscribe
        unsubscribe();
        resolve();
      });
    });
  },

  setUser: (user) => set({ user, error: null }),
  
  setUserData: async (userData) => {
    const { user } = get();
    if (user && userData) {
      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        set({ userData, error: null });
      } catch (error) {
        console.error('Error updating user data:', error);
        
        let errorMessage = 'Failed to save user data';
        switch (error.code) {
          case 'permission-denied':
          case 'firestore/permission-denied':
            errorMessage = 'Permission denied saving user data';
            break;
          case 'auth/insufficient-permission':
            errorMessage = 'Insufficient permissions to save data';
            break;
        }
        
        set({ error: errorMessage });
        throw error; // Re-throw so caller can handle
      }
    }
  },

  updateUserData: async (updates) => {
    const { user, userData } = get();
    if (user && userData) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
        set({ userData: { ...userData, ...updates }, error: null });
      } catch (error) {
        console.error('Error updating user data:', error);
        
        let errorMessage = 'Failed to update user data';
        switch (error.code) {
          case 'permission-denied':
          case 'firestore/permission-denied':
            errorMessage = 'Permission denied updating user data';
            break;
          case 'auth/insufficient-permission':
            errorMessage = 'Insufficient permissions to update data';
            break;
        }
        
        set({ error: errorMessage });
        throw error; // Re-throw so caller can handle
      }
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        userData: null,
        error: null
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ error: 'Failed to sign out' });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;