import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadUserChats();
  }, [user, isAuthenticated, navigate]);

  // Load user's chats
  const loadUserChats = async () => {
    if (!user?.uid) return;

    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const userChats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChats(userChats);
        
        // Auto-select first chat if none selected
        if (userChats.length > 0 && !activeChat) {
          setActiveChat(userChats[0]);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Load messages for active chat
  useEffect(() => {
    if (!activeChat) return;

    const messagesQuery = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const chatMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [activeChat]);

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        content: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.phoneNumber || 'Unknown User',
        timestamp: serverTimestamp(),
        type: 'text'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - could show toast notification
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat (demo function - you might want a proper UI for this)
  const createDemoChat = async () => {
    if (!user?.uid) return;

    try {
      const createChat = httpsCallable(functions, 'createChat');
      const result = await createChat({
        participants: [user.uid],
        chatName: 'General Chat',
        isGroupChat: false,
        type: 'public'
      });
      
      console.log('Chat created:', result.data);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-blue-600 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Echo Chat</h1>
            <button
              onClick={handleLogout}
              className="text-sm bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
          <p className="text-sm opacity-75 mt-1">
            {user?.displayName || user?.phoneNumber || 'User'}
          </p>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 mb-4">No chats available</p>
              <Button onClick={createDemoChat} size="sm">
                Create Demo Chat
              </Button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <h3 className="font-medium">
                  {chat.chatName || 'Unnamed Chat'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {chat.latestMessage?.content || 'No messages yet'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 bg-white border-b border-gray-300">
              <h2 className="text-lg font-semibold">
                {activeChat.chatName || 'Chat'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeChat.participants?.length || 0} participants
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.uid
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.senderId !== user?.uid && (
                      <p className="text-xs opacity-75 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <p>{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.timestamp instanceof Date
                        ? message.timestamp.toLocaleTimeString()
                        : 'Now'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 bg-white border-t border-gray-300">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !newMessage.trim()}>
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Echo Chat
              </h3>
              <p className="text-gray-500">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
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