import React, { useState } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  Shield, 
  Moon, 
  Globe, 
  Volume2, 
  Vibrate, 
  Smartphone,
  Check
} from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    messageNotifications: true,
    groupNotifications: true,
    statusNotifications: false,
    emailNotifications: true,
    pushNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'contacts', // 'everyone', 'contacts', 'nobody'
    lastSeenVisibility: 'contacts',
    statusVisibility: 'contacts',
    readReceipts: true,
    
    // Chat Settings
    enterToSend: true,
    darkMode: false,
    language: 'en',
    
    // Sound Settings
    messageSound: true,
    notificationSound: true,
    vibration: true,
    
    // Storage Settings
    autoDownloadImages: true,
    autoDownloadVideos: false,
    autoDownloadDocuments: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingToggle = ({ title, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
    </div>
  );

  const SettingSelect = ({ title, description, value, options, onChange }) => (
    <div className="py-3">
      <div className="flex-1 mb-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-1">
            <SettingToggle
              title="Message Notifications"
              description="Receive notifications for new messages"
              value={settings.messageNotifications}
              onChange={() => handleToggle('messageNotifications')}
            />
            <SettingToggle
              title="Group Notifications"
              description="Receive notifications for group messages"
              value={settings.groupNotifications}
              onChange={() => handleToggle('groupNotifications')}
            />
            <SettingToggle
              title="Status Notifications"
              description="Get notified when contacts update their status"
              value={settings.statusNotifications}
              onChange={() => handleToggle('statusNotifications')}
            />
            <SettingToggle
              title="Email Notifications"
              description="Receive important updates via email"
              value={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <SettingToggle
              title="Push Notifications"
              description="Allow push notifications on this device"
              value={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
          </div>
          <div className="space-y-4">
            <SettingSelect
              title="Profile Visibility"
              description="Who can see your profile information"
              value={settings.profileVisibility}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'contacts', label: 'My Contacts' },
                { value: 'nobody', label: 'Nobody' }
              ]}
              onChange={(value) => handleSelect('profileVisibility', value)}
            />
            <SettingSelect
              title="Last Seen Visibility"
              description="Who can see when you were last online"
              value={settings.lastSeenVisibility}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'contacts', label: 'My Contacts' },
                { value: 'nobody', label: 'Nobody' }
              ]}
              onChange={(value) => handleSelect('lastSeenVisibility', value)}
            />
            <SettingSelect
              title="Status Visibility"
              description="Who can see your status updates"
              value={settings.statusVisibility}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'contacts', label: 'My Contacts' },
                { value: 'nobody', label: 'Nobody' }
              ]}
              onChange={(value) => handleSelect('statusVisibility', value)}
            />
            <SettingToggle
              title="Read Receipts"
              description="Let others know when you've read their messages"
              value={settings.readReceipts}
              onChange={() => handleToggle('readReceipts')}
            />
          </div>
        </div>

        {/* Chat Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
          </div>
          <div className="space-y-4">
            <SettingToggle
              title="Enter to Send"
              description="Press Enter to send messages (Shift+Enter for new line)"
              value={settings.enterToSend}
              onChange={() => handleToggle('enterToSend')}
            />
            <SettingToggle
              title="Dark Mode"
              description="Use dark theme throughout the app"
              value={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            <SettingSelect
              title="Language"
              description="Choose your preferred language"
              value={settings.language}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'pt', label: 'Português' }
              ]}
              onChange={(value) => handleSelect('language', value)}
            />
          </div>
        </div>

        {/* Sound & Vibration Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sound & Vibration</h2>
          </div>
          <div className="space-y-1">
            <SettingToggle
              title="Message Sounds"
              description="Play sound when receiving messages"
              value={settings.messageSound}
              onChange={() => handleToggle('messageSound')}
            />
            <SettingToggle
              title="Notification Sounds"
              description="Play sound for notifications"
              value={settings.notificationSound}
              onChange={() => handleToggle('notificationSound')}
            />
            <SettingToggle
              title="Vibration"
              description="Vibrate on notifications (mobile only)"
              value={settings.vibration}
              onChange={() => handleToggle('vibration')}
            />
          </div>
        </div>

        {/* Storage & Media Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Storage & Media</h2>
          </div>
          <div className="space-y-1">
            <SettingToggle
              title="Auto-download Images"
              description="Automatically download images in conversations"
              value={settings.autoDownloadImages}
              onChange={() => handleToggle('autoDownloadImages')}
            />
            <SettingToggle
              title="Auto-download Videos"
              description="Automatically download videos in conversations"
              value={settings.autoDownloadVideos}
              onChange={() => handleToggle('autoDownloadVideos')}
            />
            <SettingToggle
              title="Auto-download Documents"
              description="Automatically download documents in conversations"
              value={settings.autoDownloadDocuments}
              onChange={() => handleToggle('autoDownloadDocuments')}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Check className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Settings are saved automatically as you make changes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;