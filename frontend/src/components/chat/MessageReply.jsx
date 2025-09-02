import React from 'react';
import { Reply, X } from 'lucide-react';

const MessageReply = ({ replyTo, onReply, onCancelReply }) => {
  if (!replyTo) return null;

  const truncateMessage = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getMessagePreview = (message) => {
    if (message.type === 'text') {
      return truncateMessage(message.content);
    } else if (message.type === 'image') {
      return '📷 Image';
    } else if (message.type === 'voice') {
      return '🎤 Voice message';
    } else if (message.type === 'file') {
      return '📎 File';
    } else if (message.type === 'video') {
      return '🎥 Video';
    }
    return 'Message';
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-2 mb-2 mx-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <Reply className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-700">
                {replyTo.senderName || 'Unknown User'}
              </span>
              <span className="text-xs text-blue-600">
                {new Date(replyTo.timestamp?.toDate?.() || replyTo.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="text-sm text-gray-700 mt-1 truncate">
              {getMessagePreview(replyTo)}
            </div>
          </div>
        </div>
        
        <button
          onClick={onCancelReply}
          className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors ml-2 flex-shrink-0"
          title="Cancel reply"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Component for displaying a reply within a message
export const MessageReplyBubble = ({ replyTo, onClick }) => {
  if (!replyTo) return null;

  const getMessagePreview = (message) => {
    if (message.type === 'text') {
      return message.content.length > 50 
        ? message.content.substring(0, 50) + '...' 
        : message.content;
    } else if (message.type === 'image') {
      return '📷 Image';
    } else if (message.type === 'voice') {
      return '🎤 Voice message';
    } else if (message.type === 'file') {
      return '📎 File';
    } else if (message.type === 'video') {
      return '🎥 Video';
    }
    return 'Message';
  };

  return (
    <div 
      className="bg-gray-100 border-l-2 border-gray-400 px-3 py-2 mb-2 rounded-r-lg cursor-pointer hover:bg-gray-150 transition-colors"
      onClick={() => onClick && onClick(replyTo)}
      title="View original message"
    >
      <div className="flex items-center space-x-1 mb-1">
        <Reply className="w-3 h-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">
          {replyTo.senderName || 'Unknown User'}
        </span>
      </div>
      <div className="text-sm text-gray-700">
        {getMessagePreview(replyTo)}
      </div>
    </div>
  );
};

export default MessageReply;