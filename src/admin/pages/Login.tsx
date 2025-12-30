import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRANDING } from '../../config/branding';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { AuthError } from '@supabase/supabase-js';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = searchParams.get('type');
    const message = searchParams.get('message');
    const hashType = hashParams.get('type');

    const isVerificationCallback =
      hashType === 'signup' ||
      hashType === 'email_change' ||
      type === 'signup' ||
      (message && message.includes('confirmed'));

    if (type === 'recovery' || hashType === 'recovery') {
      setSuccessMessage('Password reset successful! Please log in with your new password.');
      window.history.replaceState({}, document.title, '/admin/login');
    } else if (isVerificationCallback) {
      setSuccessMessage('Email verified! You can now log in.');
      window.history.replaceState({}, document.title, '/admin/login');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !isLoading && !isRedirecting) {
      setIsRedirecting(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 50);
    }
  }, [user, navigate, from, isLoading, isRedirecting]);

  const getErrorMessage = (error: AuthError): string => {
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email before signing in. Check your inbox for the verification link.';
    }

    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }

    if (error.message.includes('User not found')) {
      return 'No account found with this email. Need to create one?';
    }

    if (error.message.includes('Too many requests')) {
      return 'Too many login attempts. Please try again in a few minutes.';
    }

    if (error.status === 400) {
      return 'Invalid email or password. Please try again.';
    }

    if (error.message.includes('Network')) {
      return 'Unable to connect. Please check your internet connection.';
    }

    return error.message || 'An error occurred during login. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      setIsRedirecting(true);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = getErrorMessage(err as AuthError);
      setError(errorMessage);
      setPassword('');
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const isSubmitting = isLoading || isRedirecting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={BRANDING.logoUrl} alt={BRANDING.companyName} className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to manage your properties</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[60px]">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset functionality coming soon')}
                  className="text-xs text-[#7CB342] hover:text-[#689F38] font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              <span className="inline-block min-w-[100px] text-center">
                {isRedirecting ? 'Redirecting...' : isLoading ? 'Signing In...' : 'Sign In'}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Need an account?{' '}
              <Link to="/admin/register" className="text-[#7CB342] hover:text-[#689F38] font-medium">
                Create one
              </Link>
            </p>
            <Link to="/" className="block text-sm text-gray-600 hover:text-[#7CB342]">
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
