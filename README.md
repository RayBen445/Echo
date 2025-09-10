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
- **🤖 AI Assistant (Mock)**: Placeholder implementation for Google Gemini AI integration

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

## 🤖 AI Integration Status

### Google Gemini AI - Mock Implementation

Echo includes an AI Assistant component that displays "Powered by Google Gemini" but currently uses a **mock implementation** for demonstration purposes.

**Current Status:**
- ✅ UI Component: Fully functional AI assistant interface
- ✅ Chat Integration: Accessible through chat interface
- ❌ Real API: Mock responses instead of actual Google Gemini API calls
- ❌ Dependencies: No `@google/generative-ai` package installed
- ❌ Configuration: No API key setup for Google Gemini

**Location:** `frontend/src/components/chat/AIAssistant.jsx`

**To implement real Google Gemini integration:**

1. **Install the Google Generative AI SDK:**
   ```bash
   cd frontend
   npm install @google/generative-ai
   ```

2. **Get a Google Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add to your environment variables

3. **Update environment configuration:**
   ```bash
   # Add to frontend/.env.local
   VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Replace mock implementation:**
   - Update the `callGeminiAPI` function in `AIAssistant.jsx`
   - Import and configure the Google Generative AI SDK
   - Handle API responses and errors appropriately

**Note:** The current mock implementation provides realistic responses for development and testing purposes without requiring API costs.

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

# Install all dependencies (root, frontend, and functions)
npm run install-all
```

### 2. Firebase Configuration
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Phone provider
3. Create Firestore database
4. Enable Cloud Storage
5. Get your Firebase config from Project Settings

### 3. Environment Setup
```bash
# Copy example environment file
cp frontend/.env.example frontend/.env.local

# Edit frontend/.env.local with your Firebase config:
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 4. Development
```bash
# Start frontend development server
npm run dev

# Optional: Start Firebase emulators for local development
npm run firebase-emulators
```

### 5. Unified Deployment Options

#### Option A: Firebase Hosting (Recommended - Full Integration)
```bash
# Deploy everything to Firebase (frontend + backend + database + functions)
npm run firebase-deploy
```

#### Option B: Vercel + Firebase Functions (Hybrid Deployment)
```bash
# Deploy Firebase functions first
npm run functions-deploy

# Then deploy frontend to Vercel
vercel --prod
```

### 6. Testing Deployment
```bash
# Run deployment validation test
./test-deployment.sh
```

**Note**: With Vercel deployment:
- Frontend is hosted on Vercel
- Firebase services (Functions, Firestore, Storage, Auth) remain on Firebase
- You still need to deploy Firebase backend services separately:
  ```bash
  firebase deploy --only functions,firestore,storage
  ```

#### Environment Variables for Vercel
In your Vercel dashboard, add these environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`
- `VITE_GOOGLE_GEMINI_API_KEY` (optional - for real AI integration)

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