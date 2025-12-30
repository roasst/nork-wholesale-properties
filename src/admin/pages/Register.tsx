import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { BRANDING } from '../../config/branding';
import { UserInvitation } from '../types';
import { CheckCircle } from 'lucide-react';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const token = searchParams.get('token');
  const OWNER_EMAIL = 'luke@roasst.com';

  useEffect(() => {
    (async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (fetchError || !data) {
          setError('Invalid or expired invitation');
          setIsLoading(false);
          return;
        }

        if (data.accepted_at) {
          setError('This invitation has already been used');
          setIsLoading(false);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError('This invitation has expired');
          setIsLoading(false);
          return;
        }

        setInvitation(data);
        setEmail(data.email);
      } catch (err) {
        setError('Failed to validate invitation');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const emailToRegister = invitation?.email || email;

      if (invitation) {
        await signUp(invitation.email, password, fullName, invitation.role);

        await supabase
          .from('user_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invitation.id);
      } else if (email === OWNER_EMAIL) {
        const { data: ownerInvitation } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('email', OWNER_EMAIL)
          .eq('role', 'owner')
          .is('accepted_at', null)
          .maybeSingle();

        if (!ownerInvitation) {
          setError('No pending owner invitation found for this email');
          setIsSubmitting(false);
          return;
        }

        await signUp(email, password, fullName, 'owner');

        await supabase
          .from('user_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', ownerInvitation.id);
      } else {
        setError('Invalid email or invitation required');
        setIsSubmitting(false);
        return;
      }

      setRegisteredEmail(emailToRegister);
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation && token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/admin/login"
            className="inline-block bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={BRANDING.logoUrl} alt={BRANDING.companyName} className="h-16 mx-auto mb-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>

            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            <p className="text-gray-900 font-semibold mb-6">{registeredEmail}</p>

            <p className="text-gray-600 mb-8">
              Please check your inbox and click the link to activate your account. After verifying, you can log in.
            </p>

            <Link
              to="/admin/login"
              className="inline-block w-full bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </Link>

            <p className="text-sm text-gray-500 mt-6">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={BRANDING.logoUrl} alt={BRANDING.companyName} className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Complete your registration</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && invitation && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!invitation}
                required
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                  invitation ? 'bg-gray-100 text-gray-600' : 'focus:ring-2 focus:ring-[#7CB342] focus:border-transparent'
                }`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-sm text-gray-600 hover:text-[#7CB342]">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
