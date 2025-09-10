# Echo Unified Deployment Guide

## 🚀 Unified Deployment Options

### Option 1: Firebase Hosting (Recommended for Full Integration)
```bash
# Install all dependencies
npm run install-all

# Build and deploy everything to Firebase
npm run firebase-deploy
```

### Option 2: Vercel + Firebase Functions (Hybrid)
```bash
# Deploy Firebase Functions first
npm run functions-deploy

# Then deploy frontend to Vercel
vercel --prod
```

## 📋 Pre-deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set up (see section below)
- [ ] Frontend builds successfully (`npm run build`)  
- [ ] Firebase services enabled (Auth, Firestore, Storage, Functions, FCM)
- [ ] Firebase Functions deployed (`npm run functions-deploy`)

## 🔧 Environment Variables Required

### For Vercel Deployment
Set these in your Vercel dashboard or `.env.local`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### For Firebase Hosting
Create `frontend/.env.production`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## 🏗️ Architecture Changes

### ✅ Unified Structure
- **Frontend**: React + Vite + Firebase SDK
- **Backend**: Firebase Cloud Functions only
- **Database**: Firestore for real-time data
- **Authentication**: Firebase Auth with phone number
- **Real-time**: Firestore listeners (replaced Socket.IO)
- **Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging

### ❌ Removed Components
- Express.js server (`backend/` directory)
- Socket.IO real-time communication
- MongoDB database
- Custom JWT authentication
- Axios HTTP client

## 🔄 Development Workflow

```bash
# Start development
npm run dev

# Start Firebase emulators (optional)
npm run firebase-emulators

# Build for production
npm run build

# Deploy to Firebase hosting
npm run firebase-deploy

# Deploy only functions
npm run functions-deploy
```

## 📱 Post-deployment Setup

1. **Firebase Console**: Verify all services are active
2. **Authentication**: Configure phone auth providers
3. **Database**: Check Firestore rules are applied
4. **Storage**: Verify media upload permissions
5. **Functions**: Test cloud functions are working
6. **Notifications**: Test FCM push notifications

## 🚨 Breaking Changes

- Login now uses phone number + OTP instead of username/password
- Real-time chat uses Firestore listeners instead of Socket.IO
- All backend APIs now use Firebase Cloud Functions
- No separate backend server required