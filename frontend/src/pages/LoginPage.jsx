import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrors({ phoneNumber: 'Please enter a valid phone number with country code (e.g., +1234567890)' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const confirmation = await sendOTP(phoneNumber);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ phoneNumber: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await verifyOTP(confirmationResult, otp);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const confirmation = await sendOTP(phoneNumber);
      setConfirmationResult(confirmation);
      setErrors({});
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Echo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'phone' ? 'Enter your phone number to get started' : 'Enter the verification code'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={handlePhoneSubmit}>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={errors.phoneNumber}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Please include your country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={errors.otp}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Code sent to {phoneNumber}
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goBackToPhone}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Echo?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 border-gray-300"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;