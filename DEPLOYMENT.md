# Echo Deployment Guide

## 🚀 Quick Deployment

### Firebase Deployment (All-in-one)
```bash
firebase login
firebase deploy
```

### Vercel Deployment (Frontend only)
```bash
vercel --prod
```
*Note: You still need Firebase services running for backend functionality*

## 📋 Pre-deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set up (.env files or Vercel dashboard)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Firebase services enabled (Auth, Firestore, Storage, Functions, FCM)

## 🔧 Environment Variables Required

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## 📱 Post-deployment Setup

1. **Firebase Console**: Verify all services are active
2. **Authentication**: Test phone number login flow
3. **Database**: Check Firestore rules are applied
4. **Storage**: Verify media upload permissions
5. **Notifications**: Test FCM push notifications