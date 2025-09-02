import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import useAuthStore from '../../stores/authStore';
import {
  Users,
  MessageCircle,
  Image,
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Crown,
  Search,
  Filter
} from 'lucide-react';

const AdminPanel = () => {
  const { userData } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalReports: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Check if user is admin
  const isAdmin = userData?.role === 'admin' || userData?.email === 'admin@echo.com';

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
      
      onSnapshot(usersQuery, (snapshot) => {
        const userData = [];
        snapshot.forEach((doc) => {
          userData.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userData);
        setStats(prev => ({ ...prev, totalUsers: userData.length }));
      });

      // Load recent messages for moderation
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));
      
      onSnapshot(messagesQuery, (snapshot) => {
        const messageData = [];
        snapshot.forEach((doc) => {
          messageData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messageData);
        setStats(prev => ({ ...prev, totalMessages: messageData.length }));
      });

      // Load reports
      const reportsRef = collection(db, 'reports');
      const reportsQuery = query(reportsRef, orderBy('timestamp', 'desc'), limit(50));
      
      onSnapshot(reportsQuery, (snapshot) => {
        const reportData = [];
        snapshot.forEach((doc) => {
          reportData.push({ id: doc.id, ...doc.data() });
        });
        setReports(reportData);
        setStats(prev => ({ ...prev, totalReports: reportData.length }));
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: true,
        bannedAt: new Date()
      });
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const unbanUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: false,
        bannedAt: null
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const makeAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'admin'
      });
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  const removeAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'user'
      });
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {user.displayName?.charAt(0) || '?'}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.displayName || 'Unknown User'}
            </div>
            <div className="text-sm text-gray-500">
              {user.email || user.phoneNumber}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {user.banned ? 'Banned' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.role === 'admin' ? (
          <Crown className="w-4 h-4 text-yellow-500" />
        ) : (
          'User'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        {user.banned ? (
          <button
            onClick={() => unbanUser(user.id)}
            className="text-green-600 hover:text-green-900"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => banUser(user.id)}
            className="text-red-600 hover:text-red-900"
          >
            <UserX className="w-4 h-4" />
          </button>
        )}
        
        {user.role === 'admin' ? (
          <button
            onClick={() => removeAdmin(user.id)}
            className="text-orange-600 hover:text-orange-900"
          >
            Remove Admin
          </button>
        ) : (
          <button
            onClick={() => makeAdmin(user.id)}
            className="text-blue-600 hover:text-blue-900"
          >
            Make Admin
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {userData?.displayName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total Messages"
                value={stats.totalMessages}
                icon={MessageCircle}
                color="green"
              />
              <StatCard
                title="Reports"
                value={stats.totalReports}
                icon={AlertTriangle}
                color="red"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={Users}
                color="purple"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {message.senderName} sent a message
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.timestamp?.toDate?.()?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users
                    .filter(user => 
                      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.phoneNumber?.includes(searchTerm)
                    )
                    .map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Message Moderation</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {messages.slice(0, 20).map((message) => (
                  <div key={message.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {message.senderName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {message.timestamp?.toDate?.()?.toLocaleString()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.type === 'text' ? 'bg-blue-100 text-blue-800' :
                            message.type === 'image' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.type}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {message.type === 'text' 
                            ? message.content 
                            : `[${message.type.toUpperCase()}] ${message.filename || 'Media file'}`
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Content Reports</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Reports</h3>
              </div>
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reports to display</p>
                  <p className="text-sm">Reports will appear here when users report content</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">User Registration</h4>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Message Moderation</h4>
                    <p className="text-sm text-gray-500">Automatically moderate messages</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;