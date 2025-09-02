const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Send push notification when a new message is created
exports.sendMessageNotification = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const messageData = event.data.data();
    const chatId = event.params.chatId;
    const senderId = messageData.senderId;

    try {
      // Get chat details
      const chatDoc = await db.collection('chats').doc(chatId).get();
      const chatData = chatDoc.data();
      
      // Get sender details
      const senderDoc = await db.collection('users').doc(senderId).get();
      const senderData = senderDoc.data();
      
      // Get all participants except sender
      const recipients = chatData.participants.filter(id => id !== senderId);
      
      // Get device tokens for all recipients
      const tokenPromises = recipients.map(async (userId) => {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        return userData.deviceTokens || [];
      });
      
      const tokenArrays = await Promise.all(tokenPromises);
      const allTokens = tokenArrays.flat().filter(token => token);
      
      if (allTokens.length === 0) {
        console.log('No device tokens found for recipients');
        return null;
      }
      
      // Prepare notification payload
      const payload = {
        notification: {
          title: chatData.isGroupChat ? chatData.chatName : senderData.displayName,
          body: `${senderData.displayName}: ${messageData.content || 'Media message'}`,
          icon: senderData.profilePictureUrl || '/default-avatar.png'
        },
        data: {
          chatId: chatId,
          senderId: senderId,
          type: 'message'
        },
        tokens: allTokens
      };
      
      // Send multicast message
      const response = await messaging.sendMulticast(payload);
      console.log('Successfully sent message:', response);
      
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
);

// Delete expired statuses
exports.deleteExpiredStatuses = onCall(async (request) => {
  try {
    const now = admin.firestore.Timestamp.now();
    const expiredStatusesQuery = await db.collection('statuses')
      .where('expiresAt', '<=', now)
      .get();
    
    const batch = db.batch();
    expiredStatusesQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return {
      success: true,
      deletedCount: expiredStatusesQuery.docs.length
    };
  } catch (error) {
    console.error('Error deleting expired statuses:', error);
    throw new HttpsError('internal', 'Failed to delete expired statuses');
  }
});

// Handle contact requests
exports.sendContactRequest = onCall(async (request) => {
  const { targetUserId } = request.data;
  const requesterId = request.auth.uid;
  
  if (!targetUserId || !requesterId) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }
  
  if (targetUserId === requesterId) {
    throw new HttpsError('invalid-argument', 'Cannot send request to yourself');
  }
  
  try {
    // Check if users already have each other as contacts
    const requesterDoc = await db.collection('users').doc(requesterId).get();
    const targetDoc = await db.collection('users').doc(targetUserId).get();
    
    const requesterData = requesterDoc.data();
    const targetData = targetDoc.data();
    
    if (requesterData.contacts && requesterData.contacts.includes(targetUserId)) {
      throw new HttpsError('already-exists', 'Users are already contacts');
    }
    
    if (targetData.pendingRequests && targetData.pendingRequests.includes(requesterId)) {
      throw new HttpsError('already-exists', 'Contact request already sent');
    }
    
    // Add request to target user's pending requests
    await db.collection('users').doc(targetUserId).update({
      pendingRequests: admin.firestore.FieldValue.arrayUnion(requesterId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending contact request:', error);
    throw new HttpsError('internal', 'Failed to send contact request');
  }
});

// Accept contact request
exports.acceptContactRequest = onCall(async (request) => {
  const { requesterId } = request.data;
  const accepterId = request.auth.uid;
  
  if (!requesterId || !accepterId) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }
  
  try {
    const batch = db.batch();
    
    // Add each other to contacts
    const requesterRef = db.collection('users').doc(requesterId);
    const accepterRef = db.collection('users').doc(accepterId);
    
    batch.update(requesterRef, {
      contacts: admin.firestore.FieldValue.arrayUnion(accepterId)
    });
    
    batch.update(accepterRef, {
      contacts: admin.firestore.FieldValue.arrayUnion(requesterId),
      pendingRequests: admin.firestore.FieldValue.arrayRemove(requesterId)
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error('Error accepting contact request:', error);
    throw new HttpsError('internal', 'Failed to accept contact request');
  }
});

// Create a new chat
exports.createChat = onCall(async (request) => {
  const { participants, chatName, isGroupChat, type } = request.data;
  const creatorId = request.auth.uid;
  
  if (!participants || participants.length === 0) {
    throw new HttpsError('invalid-argument', 'Participants are required');
  }
  
  try {
    // For one-on-one chats, check if chat already exists
    if (!isGroupChat && participants.length === 2) {
      const existingChatQuery = await db.collection('chats')
        .where('participants', 'array-contains-any', participants)
        .where('isGroupChat', '==', false)
        .get();
      
      for (const doc of existingChatQuery.docs) {
        const chatData = doc.data();
        if (chatData.participants.length === 2 && 
            participants.every(p => chatData.participants.includes(p))) {
          return { chatId: doc.id, exists: true };
        }
      }
    }
    
    // Create new chat
    const chatData = {
      participants: participants,
      chatName: chatName || '',
      isGroupChat: isGroupChat || false,
      type: type || 'one_on_one',
      admins: isGroupChat ? [creatorId] : [],
      createdAt: admin.firestore.Timestamp.now(),
      latestMessage: null
    };
    
    const chatRef = await db.collection('chats').add(chatData);
    
    return { chatId: chatRef.id, exists: false };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw new HttpsError('internal', 'Failed to create chat');
  }
});

// Update typing indicator
exports.updateTypingStatus = onCall(async (request) => {
  const { chatId, isTyping } = request.data;
  const userId = request.auth.uid;
  
  if (!chatId) {
    throw new HttpsError('invalid-argument', 'Chat ID is required');
  }
  
  try {
    const typingRef = db.collection('chats').doc(chatId).collection('typing').doc(userId);
    
    if (isTyping) {
      await typingRef.set({
        userId: userId,
        timestamp: admin.firestore.Timestamp.now()
      });
    } else {
      await typingRef.delete();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating typing status:', error);
    throw new HttpsError('internal', 'Failed to update typing status');
  }
});

// Clean up old typing indicators (called periodically)
exports.cleanupTypingIndicators = onCall(async (request) => {
  try {
    const cutoffTime = admin.firestore.Timestamp.fromMillis(
      Date.now() - 30000 // 30 seconds ago
    );
    
    const chatsSnapshot = await db.collection('chats').get();
    const batch = db.batch();
    
    for (const chatDoc of chatsSnapshot.docs) {
      const typingSnapshot = await chatDoc.ref.collection('typing')
        .where('timestamp', '<', cutoffTime)
        .get();
      
      typingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up typing indicators:', error);
    throw new HttpsError('internal', 'Failed to cleanup typing indicators');
  }
});