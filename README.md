# Echo - Real-Time Chat Application

A modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) using a monorepo architecture. Echo provides secure user authentication and instant messaging capabilities with a clean, responsive UI.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT tokens
- **Secure password hashing** with bcryptjs
- **Responsive design** with Tailwind CSS
- **Modern React** with hooks and context API
- **Fast development** with Vite
- **Monorepo structure** for better code organization
- **Input validation** and error handling
- **Persistent chat history** with MongoDB

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

## 📁 Project Structure

```
Echo/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── api/
│       │   └── auth.js
│       ├── config/
│       │   └── database.js
│       ├── controllers/
│       │   └── authController.js
│       ├── middlewares/
│       │   └── auth.js
│       ├── models/
│       │   ├── messageModel.js
│       │   └── userModel.js
│       └── utils/
│           └── jwt.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── api/
        │   └── index.js
        ├── components/
        │   ├── Button.jsx
        │   └── Input.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ChatPage.jsx
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/RayBen445/Echo.git
cd Echo
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/echo
# JWT_SECRET=your_jwt_secret_here_change_in_production
# PORT=5000
# NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Setup
Make sure MongoDB is running on your system:
- **Local MongoDB**: Start the MongoDB service
- **MongoDB Atlas**: Update the MONGODB_URI in .env with your connection string

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

2. **Start the frontend development server:**
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

### Production Build

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Start the backend:**
```bash
cd backend
npm start
```

## 📱 Usage

1. **Registration**: Navigate to `/register` to create a new account
2. **Login**: Use `/login` to sign in with existing credentials
3. **Chat**: Once authenticated, you'll be redirected to the chat interface
4. **Real-time Messaging**: Send messages that appear instantly for all connected users
5. **Logout**: Use the logout button to end your session

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check

### Socket.IO Events
- `join` - Authenticate and join chat room
- `sendMessage` - Send a message to all users
- `receiveMessage` - Receive messages from other users
- `getRecentMessages` - Get recent chat history
- `userJoined` - Notification when user joins
- `userLeft` - Notification when user leaves

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme Support**: Clean, accessible design
- **Real-time Status**: Connection status indicator
- **Message History**: Persistent chat history
- **User Feedback**: Loading states and error messages
- **Smooth Animations**: Polished user experience

## 🔄 Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Tailwind CSS for the beautiful UI
- Vite for the fast development experience
- MongoDB for reliable data storage