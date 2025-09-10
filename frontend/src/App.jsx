import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useChatStore from './stores/chatStore';
import DualAuth from './components/auth/PhoneAuth';
import Layout from './components/layout/Layout';
import ErrorNotification from './components/common/ErrorNotification';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import StatusFeedPage from './pages/StatusFeedPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Echo...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, isLoading, isInitialized, error } = useAuthStore();
  
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.862-.833-2.632 0L4.182 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

// Public route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuthStore();
  
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }
  
  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  const { initialize, error, clearError } = useAuthStore();
  const { cleanup, error: chatError, clearError: clearChatError } = useChatStore();

  useEffect(() => {
    // Initialize authentication
    initialize();

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  return (
    <Router>
      <div className="App">
        {/* Global error notifications */}
        <ErrorNotification 
          error={error} 
          onClose={clearError}
        />
        <ErrorNotification 
          error={chatError} 
          onClose={clearChatError}
        />
        
        <Routes>
          {/* Authentication route */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <DualAuth />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes with layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard (main feed) */}
            <Route index element={<DashboardPage />} />
            
            {/* Contacts management */}
            <Route path="contacts" element={<ContactsPage />} />
            
            {/* Status feed */}
            <Route path="status" element={<StatusFeedPage />} />
            
            {/* Profile page */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Settings page */}
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Notifications page */}
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Admin panel */}
            <Route path="admin" element={<AdminPage />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;