import { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { RoleBadge } from '../components/RoleBadge';
import { Toast, ToastType } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Profile = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await updateProfile({ full_name: fullName });
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setToast({ message: 'Password changed successfully', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setToast({ message: 'Failed to change password', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setToast({ message: 'Failed to sign out', type: 'error' });
    }
  };

  if (!profile) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div>
                <RoleBadge role={profile.role} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Role is managed by administrators</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign Out</h2>
          <p className="text-gray-600 mb-4">Sign out from your account on this device.</p>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
};
