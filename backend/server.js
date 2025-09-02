import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import authRoutes from './src/api/auth.js';
import Message from './src/models/messageModel.js';
import { verifyToken } from './src/utils/jwt.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Echo backend is running!', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with authentication
  socket.on('join', async (token) => {
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      console.log(`${decoded.username} joined the chat`);
      
      // Notify other users
      socket.broadcast.emit('userJoined', {
        username: decoded.username,
        message: `${decoded.username} joined the chat`
      });
    } catch (error) {
      socket.emit('error', { message: 'Invalid token' });
    }
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      if (!socket.username) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { content } = data;
      
      // Save message to database
      const message = new Message({
        author: socket.username,
        content: content.trim()
      });
      
      await message.save();

      // Broadcast message to all connected clients
      const messageData = {
        id: message._id,
        author: message.author,
        content: message.content,
        timestamp: message.timestamp
      };

      io.emit('receiveMessage', messageData);
      console.log(`Message from ${socket.username}: ${content}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle getting recent messages
  socket.on('getRecentMessages', async () => {
    try {
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      
      // Reverse to show oldest first
      const recentMessages = messages.reverse().map(msg => ({
        id: msg._id,
        author: msg.author,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      socket.emit('recentMessages', recentMessages);
    } catch (error) {
      console.error('Get recent messages error:', error);
      socket.emit('error', { message: 'Failed to get recent messages' });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.username) {
      socket.broadcast.emit('userLeft', {
        username: socket.username,
        message: `${socket.username} left the chat`
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

export default app;