'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyProfile,
  updateProfile,
  updateHandle,
  uploadProfileImage,
  deleteImages,
  type AuthUser,
  type ProfileData,
  type HandleUpdateData
} from '@/lib/auth';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    memberName: '',
    displayName: '',
    bio: '',
    location: '',
    birthDate: '',
    websiteUrl: '',
    avatarUrl: '',
  });

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialProfileRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingProfile && uploadedImageUrls.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditingProfile, uploadedImageUrls]);

  const loadProfile = async () => {
    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
      initialProfileRef.current = profileData;
      setFormData({
        memberName: profileData.memberName || '',
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        birthDate: profileData.birthDate || '',
        websiteUrl: profileData.websiteUrl || '',
        avatarUrl: profileData.avatarUrl || '',
      });
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.memberId) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const { imageUrl } = await uploadProfileImage(profile.memberId, file);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
        setUploadedImageUrls(prev => [...prev, imageUrl]);
      }
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setUploadedImageUrls([]);
  };

  const handleCancelProfileEdit = async () => {
    if (uploadedImageUrls.length > 0) {
      try {
        await deleteImages(uploadedImageUrls);
      } catch (err) {
        console.error('Failed to delete uploaded images:', err);
      }
    }

    if (initialProfileRef.current) {
      setFormData({
        memberName: initialProfileRef.current.memberName || '',
        displayName: initialProfileRef.current.displayName || '',
        bio: initialProfileRef.current.bio || '',
        location: initialProfileRef.current.location || '',
        birthDate: initialProfileRef.current.birthDate || '',
        websiteUrl: initialProfileRef.current.websiteUrl || '',
        avatarUrl: initialProfileRef.current.avatarUrl || '',
      });
    }

    setIsEditingProfile(false);
    setUploadedImageUrls([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const previousAvatarUrl = uploadedImageUrls.filter(url => url !== formData.avatarUrl);

      const profileData: ProfileData = {
        memberName: formData.memberName,
        displayName: formData.displayName,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        birthDate: formData.birthDate || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        previousAvatarUrl: previousAvatarUrl.length > 0 ? previousAvatarUrl : undefined,
      };

      await updateProfile(profileData);

      const updatedProfile = await getMyProfile();
      setProfile(updatedProfile);
      initialProfileRef.current = updatedProfile;

      if (user) {
        await updateUser({
          ...user,
          ...updatedProfile,
        });
      }

      setUploadedImageUrls([]);
      setIsEditingProfile(false);
      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      setError(err.message || '프로필 업데이트에 실패했습니다.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const formElement = e.target as HTMLFormElement;
    const newHandle = (formElement.elements.namedItem('newHandle') as HTMLInputElement).value;

    try {
      const handleData: HandleUpdateData = {
        newHandle,
      };

      await updateHandle(handleData);

      const updatedProfile = await getMyProfile();
      setProfile(updatedProfile);

      if (user) {
        await updateUser({
          ...user,
          handle: updatedProfile.handle,
        });
      }

      setSuccessMessage('핸들이 성공적으로 업데이트되었습니다.');
      formElement.reset();
    } catch (err: any) {
      setError(err.message || '핸들 업데이트에 실패했습니다.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">프로필 설정</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Profile</h2>
            {!isEditingProfile && (
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">
                      {formData.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isUploadingImage ? '...' : '📷'}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{profile.displayName}</h3>
                <p className="text-gray-600">@{profile.handle}</p>
              </div>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Seoul, Korea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelProfileEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <p className="text-gray-900">{profile.displayName}</p>
                </div>
                {profile.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{profile.location}</p>
                  </div>
                )}
                {profile.birthDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <p className="text-gray-900">{profile.birthDate}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Name</label>
                  <p className="text-gray-900">{profile.memberName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Change Handle</h3>
              <form onSubmit={handleHandleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Handle
                  </label>
                  <input
                    type="text"
                    name="newHandle"
                    defaultValue={profile.handle}
                    placeholder="Enter new handle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Current handle: @{profile.handle}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSaving ? 'Updating...' : 'Update Handle'}
                </button>
              </form>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-2">Change Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update your password to keep your account secure.
              </p>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Change Password
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your notification preferences.
              </p>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Manage Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}