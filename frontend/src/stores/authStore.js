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
              isInitialized: true
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            set({
              user,
              userData: null,
              isLoading: false,
              isInitialized: true
            });
          }
        } else {
          // User is signed out
          set({
            user: null,
            userData: null,
            isLoading: false,
            isInitialized: true
          });
        }
        
        // Resolve the promise and unsubscribe
        unsubscribe();
        resolve();
      });
    });
  },

  setUser: (user) => set({ user }),
  
  setUserData: async (userData) => {
    const { user } = get();
    if (user && userData) {
      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        set({ userData });
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  },

  updateUserData: async (updates) => {
    const { user, userData } = get();
    if (user && userData) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
        set({ userData: { ...userData, ...updates } });
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        userData: null
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}));

export default useAuthStore;