# Backend Directory - DEPRECATED

⚠️ **This directory is no longer used in the unified deployment structure.**

## What happened?

As part of the unified deployment implementation, the Express.js backend server has been replaced with Firebase Cloud Functions to create a truly unified frontend + backend deployment.

## Migration Details

- **Express.js routes** → Moved to Firebase Cloud Functions (`/functions/index.js`)
- **Socket.IO real-time chat** → Replaced with Firestore real-time listeners
- **Custom JWT authentication** → Replaced with Firebase Authentication (phone number + OTP)
- **MongoDB database** → Replaced with Firestore
- **Axios HTTP client** → Replaced with Firebase SDK direct calls

## New Architecture

- **Frontend**: React + Vite + Firebase SDK (`/frontend/`)  
- **Backend**: Firebase Cloud Functions (`/functions/`)
- **Database**: Firestore (real-time NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging

## If you need the old backend

This Express.js backend code is preserved but not actively used. The new Firebase-based architecture provides the same functionality with better scalability and easier deployment.

For development, use:
```bash
npm run dev              # Start frontend
npm run firebase-emulators  # Start Firebase emulators (optional)
```

For deployment, use:
```bash
npm run firebase-deploy  # Deploy everything to Firebase
# OR
vercel --prod            # Deploy frontend to Vercel (functions deploy separately)
```