import React, { useState } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  PhoneAuthProvider, 
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import useAuthStore from '../../stores/authStore';
import { Phone, ArrowRight, Shield, Mail, User, Eye, EyeOff } from 'lucide-react';

const DualAuth = () => {
  const [authMethod, setAuthMethod] = useState('choose'); // 'choose' | 'phone' | 'email'
  const [step, setStep] = useState('method'); // 'method' | 'phone' | 'otp' | 'email' | 'profile'
  const [isLogin, setIsLogin] = useState(true); // true for login, false for register
  
  // Phone auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  // Email auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setUserData } = useAuthStore();

  // Email authentication methods
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userCredential;
      
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
      }

      // Check if user data exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);
      } else {
        // New user, go to profile setup
        setStep('profile');
      }
    } catch (error) {
      console.error('Email auth error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered. Try logging in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please wait and try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'permission-denied':
        case 'auth/insufficient-permission':
          errorMessage = 'Permission denied. You may not have access to this account.';
          break;
        case 'firestore/permission-denied':
          errorMessage = 'Database access denied. Please contact support if this persists.';
          break;
        default:
          errorMessage = error.message || 'Authentication failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setVerificationId(confirmationResult.verificationId);
      setStep('otp');
      setError('');
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format. Please check and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'permission-denied':
        case 'auth/insufficient-permission':
          errorMessage = 'Permission denied. Please ensure you have proper access.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP. Please try again.';
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        // User exists, redirect to main app
        const userData = userDoc.data();
        setUserData(userData);
        // Navigation will be handled by the auth state change
      } else {
        // New user, go to profile setup
        setStep('profile');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'auth/missing-verification-code':
          errorMessage = 'Please enter the verification code.';
          break;
        case 'permission-denied':
        case 'auth/insufficient-permission':
          errorMessage = 'Permission denied. Please ensure you have proper access.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Invalid OTP. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found. Please sign in again.');
      }

      const userData = {
        uid: user.uid,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        displayName: displayName.trim(),
        bio: bio.trim() || '',
        profilePictureUrl: '',
        location: '',
        contacts: [],
        pendingRequests: [],
        deviceTokens: [],
        isOnline: true,
        lastSeen: new Date(),
        settings: {
          notifications: {
            messages: true,
            groups: true,
            email: true,
            push: true,
            sound: true,
            vibration: true
          },
          privacy: {
            profileVisibility: 'contacts',
            readReceipts: true,
            lastSeen: true,
            statusVisibility: 'contacts'
          },
          chat: {
            enterToSend: true,
            darkMode: false,
            language: 'en',
            fontSize: 'medium'
          },
          storage: {
            autoDownloadImages: true,
            autoDownloadVideos: false,
            autoDownloadDocuments: false
          }
        },
        stats: {
          contactsCount: 0,
          messagesCount: 0,
          postsCount: 0,
          storiesCount: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      
      let errorMessage = 'Failed to create profile. Please try again.';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Permission denied. You may not have access to create a profile.';
          break;
        case 'auth/insufficient-permission':
          errorMessage = 'Insufficient permissions. Please check your account status.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'firestore/permission-denied':
          errorMessage = 'Database access denied. Please contact support if this persists.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Failed to create profile. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {step === 'method' && <User className="w-8 h-8 text-blue-600" />}
            {(step === 'phone' || authMethod === 'phone') && <Phone className="w-8 h-8 text-blue-600" />}
            {step === 'otp' && <Shield className="w-8 h-8 text-blue-600" />}
            {(step === 'email' || authMethod === 'email') && <Mail className="w-8 h-8 text-blue-600" />}
            {step === 'profile' && <ArrowRight className="w-8 h-8 text-blue-600" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 'method' && 'Welcome to Echo'}
            {step === 'phone' && 'Phone Authentication'}
            {step === 'otp' && 'Verify Phone'}
            {step === 'email' && (isLogin ? 'Sign In' : 'Create Account')}
            {step === 'profile' && 'Complete Profile'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'method' && 'Choose your preferred authentication method'}
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && `We sent a code to ${phoneNumber}`}
            {step === 'email' && (isLogin ? 'Sign in to your account' : 'Create your new account')}
            {step === 'profile' && 'Tell us a bit about yourself'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Method Selection Step */}
        {step === 'method' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setAuthMethod('phone');
                setStep('phone');
                setError('');
              }}
              className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>Continue with Phone</span>
            </button>
            
            <button
              onClick={() => {
                setAuthMethod('email');
                setStep('email');
                setError('');
              }}
              className="w-full flex items-center justify-center space-x-3 bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Continue with Email</span>
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              Secure authentication powered by Firebase
            </div>
          </div>
        )}

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={sendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('method');
                setError('');
              }}
              className="w-full text-blue-600 hover:text-blue-700 font-medium"
              disabled={loading}
            >
              ← Back to methods
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={verifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-blue-600 hover:text-blue-700 font-medium"
              disabled={loading}
            >
              Change Phone Number
            </button>
          </form>
        )}

        {/* Email Authentication Step */}
        {step === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  !isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('method');
                setError('');
              }}
              className="w-full text-blue-600 hover:text-blue-700 font-medium"
              disabled={loading}
            >
              ← Back to methods
            </button>
          </form>
        )}

        {/* Profile Setup Step */}
        {step === 'profile' && (
          <form onSubmit={completeProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                {bio.length}/150 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          </form>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default DualAuth;