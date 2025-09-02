import React, { useState } from 'react';
import { Smile, Plus, X } from 'lucide-react';

const MessageReactions = ({ messageId, reactions = {}, onAddReaction, onRemoveReaction, currentUserId }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = [
    '👍', '❤️', '😂', '😮', '😢', '😡', 
    '👏', '🔥', '✨', '💯', '🎉', '😍',
    '🤔', '👎', '😊', '😔', '🙄', '😎'
  ];

  const handleEmojiClick = (emoji) => {
    const reactionKey = emoji;
    const userReactions = reactions[reactionKey] || [];
    
    if (userReactions.includes(currentUserId)) {
      onRemoveReaction(messageId, reactionKey);
    } else {
      onAddReaction(messageId, reactionKey);
    }
    
    setShowEmojiPicker(false);
  };

  const handleReactionClick = (reactionKey) => {
    const userReactions = reactions[reactionKey] || [];
    
    if (userReactions.includes(currentUserId)) {
      onRemoveReaction(messageId, reactionKey);
    } else {
      onAddReaction(messageId, reactionKey);
    }
  };

  const getReactionCount = (reactionKey) => {
    return reactions[reactionKey]?.length || 0;
  };

  const hasUserReacted = (reactionKey) => {
    return reactions[reactionKey]?.includes(currentUserId) || false;
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, users]) => users.length > 0)
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 6);
  };

  const topReactions = getTopReactions();

  if (topReactions.length === 0 && !showEmojiPicker) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <div className="grid grid-cols-6 gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {/* Existing reactions */}
      {topReactions.map(([reactionKey, users]) => (
        <button
          key={reactionKey}
          onClick={() => handleReactionClick(reactionKey)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border transition-all ${
            hasUserReacted(reactionKey)
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-150'
          }`}
          title={`${users.length} reaction${users.length !== 1 ? 's' : ''}`}
        >
          <span>{reactionKey}</span>
          <span className="font-medium">{getReactionCount(reactionKey)}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center justify-center w-6 h-6 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          title="Add reaction"
        >
          <Plus className="w-3 h-3" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <div className="grid grid-cols-6 gap-1 max-w-48">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className={`w-8 h-8 flex items-center justify-center text-lg rounded transition-colors ${
                    hasUserReacted(emoji)
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;