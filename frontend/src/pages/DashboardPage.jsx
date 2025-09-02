import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import useAuthStore from '../stores/authStore';
import useChatStore from '../stores/chatStore';
import { MessageCircle, Plus, Search, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { userData } = useAuthStore();
  const { chats, loadUserChats, setActiveChat } = useChatStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.uid) {
      // Load user chats
      loadUserChats(userData.uid);
      
      // Load news feed posts
      loadNewsFeed();
    }
  }, [userData]);

  const loadNewsFeed = async () => {
    if (!userData?.contacts) {
      setLoading(false);
      return;
    }

    try {
      // Get posts from user's contacts
      const contactIds = [...userData.contacts, userData.uid]; // Include own posts
      
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', 'in', contactIds),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading news feed:', error);
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const openChat = (chat) => {
    setActiveChat(chat.id);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const isGroupChat = chat.isGroupChat;
            const chatName = isGroupChat 
              ? chat.chatName 
              : chat.participants.find(p => p !== userData.uid)?.displayName || 'Unknown';

            return (
              <div
                key={chat.id}
                onClick={() => openChat(chat)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chatName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.latestMessage || 'No messages yet'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTime(chat.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* News Feed */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">News Feed</h2>
            
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userData?.displayName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">
                  Start by adding some contacts to see their posts here.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {post.authorDisplayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {post.authorDisplayName || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(post.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-900">{post.content}</p>
                    {post.mediaUrl && (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media"
                        className="mt-3 rounded-lg max-w-full h-auto"
                      />
                    )}
                  </div>
                  
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                        <span>👍</span>
                        <span className="text-sm">Like</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                        <span>💬</span>
                        <span className="text-sm">Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;