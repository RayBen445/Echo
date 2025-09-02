import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import useAuthStore from '../stores/authStore';
import VoiceRecorder from '../components/chat/VoiceRecorder';
import MessageReactions from '../components/chat/MessageReactions';
import MessageReply, { MessageReplyBubble } from '../components/chat/MessageReply';
import AIAssistant from '../components/chat/AIAssistant';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  MoreHorizontal,
  Reply,
  Copy,
  Download,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

const EnhancedChatPage = ({ chatId, chatType = 'direct' }) => {
  const { user, userData } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (!chatId || !user) return;

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = [];
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (!chatId || !user) return;

    const typingRef = doc(db, 'chats', chatId);
    
    if (isTyping) {
      updateDoc(typingRef, {
        typing: arrayUnion(user.uid)
      });
      
      // Clear typing after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        updateDoc(typingRef, {
          typing: arrayRemove(user.uid)
        });
      }, 3000);
    } else {
      updateDoc(typingRef, {
        typing: arrayRemove(user.uid)
      });
    }
  };

  // Send text message
  const sendMessage = async (messageData) => {
    if ((!newMessage.trim() && !messageData) || !chatId || !user) return;

    const message = messageData || {
      content: newMessage.trim(),
      type: 'text'
    };

    setLoading(true);
    
    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      
      const messageDoc = {
        ...message,
        senderId: user.uid,
        senderName: userData?.displayName || 'Unknown User',
        timestamp: serverTimestamp(),
        reactions: {},
        readBy: [user.uid],
        replyTo: replyTo || null
      };

      await addDoc(messagesRef, messageDoc);
      
      // Update chat last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          content: message.type === 'text' ? message.content : `${message.type} message`,
          timestamp: serverTimestamp(),
          senderId: user.uid
        },
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
      setReplyTo(null);
      handleTyping(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, type = 'file') => {
    if (!file || !chatId || !user) return;

    setUploadingFile(true);

    try {
      const timestamp = Date.now();
      const filename = `${type}s/${chatId}/${timestamp}_${file.name}`;
      
      const fileRef = storageRef(storage, filename);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const messageData = {
        type: type,
        url: downloadURL,
        filename: file.name,
        fileSize: file.size,
        content: file.name
      };

      await sendMessage(messageData);
      
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle reactions
  const handleAddReaction = async (messageId, emoji) => {
    if (!messageId || !user) return;

    const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
    
    try {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    if (!messageId || !user) return;

    const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
    
    try {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(user.uid)
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Handle message reply
  const handleReply = (message) => {
    setReplyTo(message);
  };

  // Handle voice note
  const handleSendVoiceNote = (voiceData) => {
    sendMessage(voiceData);
  };

  // Message component
  const MessageBubble = ({ message }) => {
    const isOwnMessage = message.senderId === user?.uid;
    const [showMenu, setShowMenu] = useState(false);

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const copyMessage = () => {
      if (message.type === 'text') {
        navigator.clipboard.writeText(message.content);
      }
      setShowMenu(false);
    };

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Reply bubble */}
          <MessageReplyBubble replyTo={message.replyTo} />
          
          {/* Message content */}
          <div
            className={`px-4 py-2 rounded-lg relative ${
              isOwnMessage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {!isOwnMessage && (
              <div className="text-xs font-medium text-gray-600 mb-1">
                {message.senderName}
              </div>
            )}
            
            {message.type === 'text' && (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.type === 'image' && (
              <div>
                <img 
                  src={message.url} 
                  alt={message.filename}
                  className="max-w-full rounded-lg cursor-pointer"
                  onClick={() => window.open(message.url, '_blank')}
                />
              </div>
            )}

            {message.type === 'voice' && <VoiceMessage message={message} />}
            
            {message.type === 'file' && <FileMessage message={message} />}

            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
              {isOwnMessage && (
                <span className="ml-2">
                  {message.readBy?.length > 1 ? '✓✓' : '✓'}
                </span>
              )}
            </div>

            {/* Message menu */}
            <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button
                    onClick={() => {
                      handleReply(message);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={copyMessage}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          <MessageReactions
            messageId={message.id}
            reactions={message.reactions}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            currentUserId={user?.uid}
          />
        </div>
      </div>
    );
  };

  // Voice message component
  const VoiceMessage = ({ message }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const playPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    };

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="flex items-center space-x-3">
        <audio
          ref={audioRef}
          src={message.url}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <button
          onClick={playPause}
          className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        
        <div>
          <div className="text-sm">🎤 Voice message</div>
          <div className="text-xs opacity-75">
            {formatDuration(message.duration || 0)}
          </div>
        </div>
      </div>
    );
  };

  // File message component
  const FileMessage = ({ message }) => {
    const downloadFile = () => {
      window.open(message.url, '_blank');
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className="flex items-center space-x-3 cursor-pointer" onClick={downloadFile}>
        <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full">
          <Paperclip className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-medium truncate max-w-48">
            {message.filename}
          </div>
          <div className="text-xs opacity-75">
            {formatFileSize(message.fileSize || 0)}
          </div>
        </div>
        <Download className="w-4 h-4 opacity-75" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      <MessageReply 
        replyTo={replyTo} 
        onCancelReply={() => setReplyTo(null)} 
      />

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          {/* File upload buttons */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingFile}
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Voice recorder */}
          <VoiceRecorder 
            onSendVoiceNote={handleSendVoiceNote}
            disabled={loading || uploadingFile}
          />

          {/* AI Assistant */}
          <AIAssistant 
            onSendMessage={sendMessage}
            disabled={loading || uploadingFile}
          />

          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={loading || uploadingFile}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={(!newMessage.trim() && !replyTo) || loading || uploadingFile}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, 'file');
          }
        }}
      />
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, 'image');
          }
        }}
      />
    </div>
  );
};

export default EnhancedChatPage;