import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import useAuthStore from '../stores/authStore';
import { Camera, Plus, Clock, Eye } from 'lucide-react';

const StatusFeedPage = () => {
  const { userData } = useAuthStore();
  const [statuses, setStatuses] = useState([]);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [statusContent, setStatusContent] = useState('');
  const [statusMedia, setStatusMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.contacts) {
      loadStatuses();
    }
  }, [userData]);

  const loadStatuses = () => {
    if (!userData?.contacts) return;

    // Include own statuses and contacts' statuses
    const relevantUserIds = [...userData.contacts, userData.uid];
    
    const statusesQuery = query(
      collection(db, 'statuses'),
      where('authorId', 'in', relevantUserIds),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(statusesQuery, (snapshot) => {
      const statusesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter out expired statuses
      const activeStatuses = statusesData.filter(status => {
        const expiresAt = status.expiresAt.toDate();
        return expiresAt > new Date();
      });

      setStatuses(activeStatuses);
    });

    return unsubscribe;
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatusMedia(file);
    }
  };

  const createStatus = async (e) => {
    e.preventDefault();
    if (!statusContent.trim() && !statusMedia) return;

    setLoading(true);
    try {
      let mediaUrl = '';
      
      if (statusMedia) {
        const mediaRef = ref(storage, `status-media/${userData.uid}/${Date.now()}_${statusMedia.name}`);
        const uploadResult = await uploadBytes(mediaRef, statusMedia);
        mediaUrl = await getDownloadURL(uploadResult.ref);
      }

      const statusData = {
        authorId: userData.uid,
        authorDisplayName: userData.displayName,
        content: statusContent.trim(),
        mediaUrl,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        viewedBy: []
      };

      await addDoc(collection(db, 'statuses'), statusData);

      // Reset form
      setStatusContent('');
      setStatusMedia(null);
      setShowCreateStatus(false);
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to create status');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const hoursRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60));
    
    if (hoursRemaining <= 1) {
      return 'Expires soon';
    } else {
      return `${hoursRemaining}h left`;
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Status Feed</h1>
          <p className="text-gray-600 mt-2">Share moments that disappear after 24 hours</p>
        </div>

        {/* Create Status Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {!showCreateStatus ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <button
                  onClick={() => setShowCreateStatus(true)}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Share your moment...
                </button>
              </div>
              <button
                onClick={() => setShowCreateStatus(true)}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={createStatus} className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userData?.displayName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userData?.displayName}</p>
                  <p className="text-sm text-gray-500">Creating status</p>
                </div>
              </div>

              <textarea
                value={statusContent}
                onChange={(e) => setStatusContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <span>Add Photo/Video</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                  {statusMedia && (
                    <span className="text-sm text-green-600">
                      {statusMedia.name}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateStatus(false);
                      setStatusContent('');
                      setStatusMedia(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!statusContent.trim() && !statusMedia)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sharing...' : 'Share Status'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Status Feed */}
        <div className="space-y-6">
          {statuses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No status updates</h3>
              <p className="text-gray-500">
                Be the first to share what's happening!
              </p>
            </div>
          ) : (
            statuses.map((status) => (
              <div key={status.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {status.authorDisplayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {status.authorDisplayName || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeRemaining(status.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{status.viewedBy?.length || 0} views</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {status.content && (
                    <p className="text-gray-900 mb-3">{status.content}</p>
                  )}
                  
                  {status.mediaUrl && (
                    <div className="rounded-lg overflow-hidden">
                      {status.mediaUrl.includes('video') ? (
                        <video 
                          controls
                          className="w-full max-h-96 object-cover"
                        >
                          <source src={status.mediaUrl} />
                          Your browser does not support video playback.
                        </video>
                      ) : (
                        <img 
                          src={status.mediaUrl}
                          alt="Status media"
                          className="w-full max-h-96 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusFeedPage;