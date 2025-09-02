import React, { useState, useRef } from 'react';
import { Camera, Edit3, Save, X, User, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const ProfilePage = () => {
  const { user, userData, updateUserData } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || '',
    bio: userData?.bio || '',
    email: userData?.email || '',
    location: userData?.location || ''
  });
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), editData);
      
      // Update local state
      updateUserData(editData);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload to Firebase Storage
      const imageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profilePictureUrl: downloadURL
      });

      // Update local state
      updateUserData({ profilePictureUrl: downloadURL });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not specified';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      displayName: userData?.displayName || '',
                      bio: userData?.bio || '',
                      email: userData?.email || '',
                      location: userData?.location || ''
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {userData?.profilePictureUrl ? (
                  <img 
                    src={userData.profilePictureUrl} 
                    alt={userData.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              {!isEditing ? (
                <h2 className="text-xl font-semibold text-gray-900">
                  {userData?.displayName || 'No Name'}
                </h2>
              ) : (
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-600"
                  placeholder="Enter your name"
                />
              )}
              {!isEditing ? (
                <p className="text-gray-600 mt-2">
                  {userData?.bio || 'No bio added yet'}
                </p>
              ) : (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                  rows={2}
                />
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            {/* Phone Number */}
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <p className="text-gray-900">{userData?.phoneNumber || 'Not available'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                {!isEditing ? (
                  <p className="text-gray-900">{userData?.email || 'Not specified'}</p>
                ) : (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Location</label>
                {!isEditing ? (
                  <p className="text-gray-900">{userData?.location || 'Not specified'}</p>
                ) : (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your location"
                  />
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900">{formatDate(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userData?.contacts?.length || 0}</div>
              <div className="text-sm text-gray-600">Contacts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Posts Created</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Stories Shared</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;