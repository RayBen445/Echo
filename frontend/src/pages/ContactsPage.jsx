import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import useAuthStore from '../stores/authStore';
import { Search, UserPlus, Check, X, Phone, Users } from 'lucide-react';

const ContactsPage = () => {
  const { userData, updateUserData } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      loadContacts();
      loadPendingRequests();
    }
  }, [userData]);

  const loadContacts = async () => {
    if (!userData?.contacts || userData.contacts.length === 0) {
      setContacts([]);
      return;
    }

    try {
      const contactPromises = userData.contacts.map(async (contactId) => {
        const contactDoc = await getDoc(doc(db, 'users', contactId));
        return { id: contactId, ...contactDoc.data() };
      });

      const contactsData = await Promise.all(contactPromises);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadPendingRequests = async () => {
    if (!userData?.pendingRequests || userData.pendingRequests.length === 0) {
      setPendingRequests([]);
      return;
    }

    try {
      const requestPromises = userData.pendingRequests.map(async (requesterId) => {
        const requesterDoc = await getDoc(doc(db, 'users', requesterId));
        return { id: requesterId, ...requesterDoc.data() };
      });

      const requestsData = await Promise.all(requestPromises);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search by display name or phone number
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );

      const phoneQuery = query(
        collection(db, 'users'),
        where('phoneNumber', '==', searchTerm)
      );

      const [usersSnapshot, phoneSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(phoneQuery)
      ]);

      const results = [];
      const seenIds = new Set();

      [...usersSnapshot.docs, ...phoneSnapshot.docs].forEach(doc => {
        const userData = { id: doc.id, ...doc.data() };
        if (!seenIds.has(doc.id) && doc.id !== userData.uid) {
          results.push(userData);
          seenIds.add(doc.id);
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const sendContactRequest = async (targetUserId) => {
    setLoading(true);
    try {
      const sendRequestFn = httpsCallable(functions, 'sendContactRequest');
      await sendRequestFn({ targetUserId });
      
      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== targetUserId));
    } catch (error) {
      console.error('Error sending contact request:', error);
      alert(error.message || 'Failed to send contact request');
    } finally {
      setLoading(false);
    }
  };

  const acceptContactRequest = async (requesterId) => {
    setLoading(true);
    try {
      const acceptRequestFn = httpsCallable(functions, 'acceptContactRequest');
      await acceptRequestFn({ requesterId });
      
      // Reload data
      await loadContacts();
      await loadPendingRequests();
    } catch (error) {
      console.error('Error accepting contact request:', error);
      alert('Failed to accept contact request');
    } finally {
      setLoading(false);
    }
  };

  const rejectContactRequest = async (requesterId) => {
    try {
      // Remove from pending requests in Firestore
      const updatedRequests = userData.pendingRequests.filter(id => id !== requesterId);
      await updateUserData({ pendingRequests: updatedRequests });
      
      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== requesterId));
    } catch (error) {
      console.error('Error rejecting contact request:', error);
    }
  };

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your connections and find new people</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Find People</h2>
          
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone number"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
            </div>
            <button
              onClick={searchUsers}
              disabled={searchLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Search Results</h3>
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendContactRequest(user.id)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {request.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.displayName}</p>
                      <p className="text-sm text-gray-500">{request.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptContactRequest(request.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectContactRequest(request.id)}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Contacts ({contacts.length})
          </h2>
          
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p className="text-gray-500">Search for people to add them as contacts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {contact.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {contact.displayName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.phoneNumber}
                      </p>
                      {contact.bio && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {contact.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;