import React, { useState } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  Heart, 
  Calendar,
  Clock,
  CheckCircle,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'New Message',
      description: 'John sent you a message',
      time: '2 minutes ago',
      read: false,
      avatar: null
    },
    {
      id: 2,
      type: 'group',
      title: 'Family Group',
      description: 'Sarah added 2 new photos',
      time: '15 minutes ago',
      read: false,
      avatar: null
    },
    {
      id: 3,
      type: 'reaction',
      title: 'Post Reaction',
      description: 'Mike liked your post',
      time: '1 hour ago',
      read: true,
      avatar: null
    },
    {
      id: 4,
      type: 'friend_request',
      title: 'Friend Request',
      description: 'Emma wants to connect with you',
      time: '2 hours ago',
      read: false,
      avatar: null
    },
    {
      id: 5,
      type: 'status',
      title: 'Status Update',
      description: 'Alex updated their status',
      time: '3 hours ago',
      read: true,
      avatar: null
    },
    {
      id: 6,
      type: 'system',
      title: 'System Update',
      description: 'Echo has been updated to version 2.1.0',
      time: '1 day ago',
      read: true,
      avatar: null
    }
  ]);

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'messages', 'social'
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'group':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'reaction':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'friend_request':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'status':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'messages':
        return ['message', 'group'].includes(notif.type);
      case 'social':
        return ['reaction', 'friend_request', 'status'].includes(notif.type);
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'messages', label: 'Messages', count: notifications.filter(n => ['message', 'group'].includes(n.type)).length },
              { key: 'social', label: 'Social', count: notifications.filter(n => ['reaction', 'friend_request', 'status'].includes(n.type)).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    filter === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark All as Read</span>
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You're all caught up! New notifications will appear here."
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                  notification.read 
                    ? 'border-gray-200' 
                    : 'border-blue-500 bg-blue-50'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar/Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-gray-100' : 'bg-white border-2 border-blue-200'
                  }`}>
                    {notification.avatar ? (
                      <img 
                        src={notification.avatar} 
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          notification.read ? 'text-gray-600' : 'text-gray-700'
                        }`}>
                          {notification.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Settings Link */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notification Settings</h3>
              <p className="text-xs text-gray-600 mt-1">Customize when and how you receive notifications</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
              <Settings className="w-4 h-4" />
              <span>Manage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;