import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, 'Message author is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for better query performance
messageSchema.index({ timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;