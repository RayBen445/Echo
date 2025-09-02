import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Initialize Socket.IO connection
    socket.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    socket.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      // Join with authentication token
      socket.current.emit('join', token);
      // Request recent messages
      socket.current.emit('getRecentMessages');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Message event handlers
    socket.current.on('receiveMessage', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socket.current.on('recentMessages', (recentMessages) => {
      setMessages(recentMessages);
    });

    // User event handlers
    socket.current.on('userJoined', (data) => {
      const systemMessage = {
        id: Date.now() + Math.random(),
        author: 'System',
        content: data.message,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.current.on('userLeft', (data) => {
      const systemMessage = {
        id: Date.now() + Math.random(),
        author: 'System',
        content: data.message,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    // Error handling
    socket.current.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message === 'Invalid token') {
        logout();
        navigate('/login');
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [token, user, navigate, logout]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !connected || loading) return;
    
    setLoading(true);
    socket.current.emit('sendMessage', { content: newMessage.trim() });
    setNewMessage('');
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Echo Chat</h1>
              <div className="ml-4 flex items-center">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="ml-2 text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.author === user?.username ? 'justify-end' : 'justify-start'
                    } ${message.isSystem ? 'justify-center' : ''}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isSystem
                          ? 'bg-gray-100 text-gray-600 text-sm italic'
                          : message.author === user?.username
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 shadow border border-gray-200'
                      }`}
                    >
                      {!message.isSystem && (
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {message.author}
                          </span>
                          <span className="text-xs opacity-50">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={connected ? "Type your message..." : "Connecting..."}
                    disabled={!connected}
                    className="mb-0"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!connected || !newMessage.trim()}
                  loading={loading}
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;