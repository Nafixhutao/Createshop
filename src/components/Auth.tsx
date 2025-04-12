import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';
import { emailSchema, passwordSchema, verificationCodeSchema } from '../lib/validation';
import { z } from 'zod';

type AuthMode = 'login' | 'register' | 'verify' | 'reset';

export function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, verifyOtp, resendVerification, verificationSent } = useAuthStore();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Rate limiting
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (lockoutUntil && new Date() > lockoutUntil) {
      setLockoutUntil(null);
      setAttempts(0);
    }
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (lockoutUntil && new Date() < lockoutUntil) {
      setError(`Too many attempts. Please try again in ${Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000)} seconds`);
      return;
    }

    try {
      setLoading(true);

      // Validate email
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        throw new Error(emailResult.error.errors[0].message);
      }

      if (mode === 'login') {
        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
          throw new Error(passwordResult.error.errors[0].message);
        }

        await signIn(email, password, rememberMe);
        navigate('/');
      } 
      else if (mode === 'register') {
        // Additional register validations
        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
          throw new Error(passwordResult.error.errors[0].message);
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        await signUp(email, password);
        setMode('verify');
        setSuccess('Registration successful! Please check your email for verification.');
      }
      else if (mode === 'verify') {
        const codeResult = verificationCodeSchema.safeParse(verificationCode);
        if (!codeResult.success) {
          throw new Error(codeResult.error.errors[0].message);
        }

        await verifyOtp(email, verificationCode);
        setSuccess('Email verified successfully! You can now login.');
        setMode('login');
      }
      else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset instructions have been sent to your email.');
        setMode('login');
      }

      setAttempts(0);
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      if (attempts >= 4) {
        const lockoutTime = new Date(Date.now() + 300000); // 5 minutes
        setLockoutUntil(lockoutTime);
        setError('Too many attempts. Please try again in 5 minutes.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await resendVerification(email);
      setSuccess('Verification email has been resent!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create your account'}
            {mode === 'verify' && 'Verify your email'}
            {mode === 'reset' && 'Reset your password'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center text-green-700">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {mode === 'verify' && (
              <div>
                <label htmlFor="verification-code" className="sr-only">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  name="verification-code"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 6-digit verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            )}
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (lockoutUntil && new Date() < lockoutUntil)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <span>
                  {mode === 'login' && 'Sign in'}
                  {mode === 'register' && 'Sign up'}
                  {mode === 'verify' && 'Verify Email'}
                  {mode === 'reset' && 'Reset Password'}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col space-y-3 text-center">
            {mode === 'verify' && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Didn't receive the code? Resend verification email
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}