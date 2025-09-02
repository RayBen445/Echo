# Echo - Firebase Social Messenger Platform

Echo is a comprehensive social messenger platform that seamlessly blends WhatsApp-style real-time messaging with Facebook-like social networking features, all powered by Firebase.

## 🚀 Features

### 🔐 Authentication
- **Phone/OTP Authentication**: Secure Firebase Authentication with phone number verification
- **Multi-step Registration**: Phone verification → OTP confirmation → Profile setup
- **Auto-login**: Persistent authentication state management

### 💬 Advanced Messaging Suite
- **One-on-One Chat**: Private real-time messaging between contacts
- **Group Chat**: Create groups, manage members, assign admin roles
- **Broadcast Channels**: One-to-many channels where only admins can post
- **Real-time Indicators**: Typing indicators, online/offline status, read receipts
- **Media Sharing**: Images, videos, and files with Firebase Cloud Storage
- **Voice Messages**: Record and send audio messages
- **Message Features**: Reply to messages, emoji reactions

### 📱 Social Networking Features  
- **Status/Stories**: 24-hour temporary photo/text updates
- **User Profiles**: Display name, bio, profile picture, posts feed
- **News Feed**: Chronological feed of posts from contacts
- **Posts & Interactions**: Text/image posts with likes, reactions, and comments
- **Contact Management**: Search users, send/accept friend requests

### 🔔 Push Notifications
- **Firebase Cloud Messaging**: Real-time push notifications
- **Background Support**: Notifications work when app is closed
- **Rich Notifications**: Chat notifications with sender info and actions

### 📊 Cloud Architecture
- **Firebase Firestore**: NoSQL database for all data with real-time updates
- **Cloud Functions**: Serverless backend logic for notifications and business rules
- **Cloud Storage**: Secure media file storage and delivery
- **Security Rules**: Comprehensive data access controls

## 🏗️ Architecture

### Backend (Firebase)
```
functions/
├── index.js                 # Cloud Functions (notifications, chat logic)
├── package.json            
firestore.rules              # Database security rules
storage.rules               # File storage security rules
firebase.json               # Firebase project configuration
```

### Frontend (React + Firebase)
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Phone authentication flow
│   │   └── layout/         # App layout and navigation
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Main feed + chat sidebar
│   │   ├── ContactsPage.jsx     # Contact management
│   │   ├── StatusFeedPage.jsx   # Stories/status feed
│   │   └── ProfilePage.jsx      # User profiles
│   ├── stores/
│   │   ├── authStore.js         # Zustand auth state
│   │   └── chatStore.js         # Chat state management
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   └── App.jsx
├── public/
│   ├── firebase-messaging-sw.js # Service worker for notifications
│   └── manifest.json           # PWA manifest
└── package.json
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with enabled services:
  - Authentication (Phone provider)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
  - Cloud Messaging

### 1. Clone & Install
```bash
git clone https://github.com/RayBen445/Echo.git
cd Echo

# Install frontend dependencies
cd frontend
npm install

# Install Cloud Functions dependencies  
cd ../functions
npm install
```

### 2. Firebase Configuration
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Phone provider
3. Create Firestore database
4. Enable Cloud Storage
5. Get your Firebase config from Project Settings

### 3. Environment Setup
```bash
# Frontend environment
cd frontend
cp .env.example .env

# Edit .env with your Firebase config:
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 4. Firebase Deployment
```bash
# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init

# Deploy Firestore rules, storage rules, and functions
firebase deploy

# Deploy hosting (for frontend)
npm run build  # in frontend/
firebase deploy --only hosting
```

### 5. Development
```bash
# Start Firebase emulators (recommended for development)
firebase emulators:start

# In another terminal, start frontend dev server
cd frontend
npm run dev
```

## 📱 Usage

### Authentication Flow
1. **Phone Entry**: Enter phone number with country code
2. **OTP Verification**: Receive and enter 6-digit SMS code
3. **Profile Setup**: Set display name and optional profile picture
4. **Dashboard**: Access main app with chat sidebar and news feed

### Core Features
- **Messaging**: Click "New Chat" to start conversations
- **Contacts**: Use "Contacts" tab to search and add people
- **Status**: Share 24-hour stories in "Status" tab
- **Feed**: View and create posts on the main dashboard
- **Notifications**: Receive real-time push notifications

## 🚀 Firebase Services Used

### Authentication
- Phone number authentication with SMS verification
- User session management
- Secure token-based authentication

### Firestore Database
```
users/{userId}              # User profiles, contacts, settings
chats/{chatId}             # Chat metadata (participants, admins, etc.)
chats/{chatId}/messages/{messageId}  # Individual messages
posts/{postId}             # Social media posts
posts/{postId}/reactions/{reactionId}  # Post likes/reactions
posts/{postId}/comments/{commentId}   # Post comments
statuses/{statusId}        # 24-hour stories/statuses
```

### Cloud Storage
```
profile-pictures/{userId}/  # User profile images
chat-media/{chatId}/       # Chat images, videos, files
post-media/{postId}/       # Social media attachments
status-media/{statusId}/   # Story images and videos
```

### Cloud Functions
- **sendMessageNotification**: FCM push notifications for new messages
- **deleteExpiredStatuses**: Cleanup expired stories
- **sendContactRequest**: Handle friend request logic
- **acceptContactRequest**: Process friend request acceptance
- **createChat**: Create new chat rooms
- **updateTypingStatus**: Real-time typing indicators

## 🔒 Security

### Firestore Security Rules
- Users can only access their own data and data from contacts
- Chat participants can read/write messages in their chats
- Posts are readable by all authenticated users
- Statuses are only visible to the author's contacts

### Storage Security Rules
- Profile pictures are readable by all, writable by owner
- Chat media is accessible only to chat participants
- Post media is publicly readable, writable by post author
- Status media follows contact-based visibility rules

## 📈 Scalability

This Firebase-powered architecture provides:
- **Real-time updates** without polling
- **Automatic scaling** with Firebase services
- **Global CDN** for media delivery
- **Offline support** with Firestore caching
- **Cross-platform compatibility** (Web, iOS, Android)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for the comprehensive backend-as-a-service platform
- React and Vite for the modern frontend development experience
- Tailwind CSS for the beautiful, responsive UI design
- Lucide React for the clean, modern icons
- Zustand for lightweight state management

---

**Echo** - Where messaging meets social networking, powered by Firebase. 🚀