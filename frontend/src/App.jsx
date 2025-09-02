import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useChatStore from './stores/chatStore';
import PhoneAuth from './components/auth/PhoneAuth';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import StatusFeedPage from './pages/StatusFeedPage';

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
  const { user, isLoading, isInitialized } = useAuthStore();
  
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
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
  const { initialize } = useAuthStore();
  const { cleanup } = useChatStore();

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
        <Routes>
          {/* Authentication route */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <PhoneAuth />
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
            
            {/* Profile page (placeholder) */}
            <Route path="profile" element={
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Page</h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </div>
            } />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;