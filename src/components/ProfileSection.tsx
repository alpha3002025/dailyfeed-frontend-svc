'use client';

import { useState, useRef } from 'react';
import type { AuthUser, ProfileData, HandleUpdateData } from '@/lib/auth';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';

interface ProfileSectionProps {
  profile: AuthUser | null;
  isEditingProfile: boolean;
  profileFormData: {
    memberName: string;
    displayName: string;
    bio: string;
    location: string;
    birthDate: string;
    websiteUrl: string;
    avatarUrl: string;
  };
  handleFormValue: string;
  isUploadingImage: boolean;
  uploadError: string;
  uploadSuccess: boolean;
  isPosting: boolean;
  postError: string;
  postSuccess: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditProfile: () => void;
  onCancelProfileEdit: () => void;
  onProfileSubmit: (e: React.FormEvent) => void;
  onHandleSubmit: (e: React.FormEvent) => void;
  setProfileFormData: React.Dispatch<React.SetStateAction<{
    memberName: string;
    displayName: string;
    bio: string;
    location: string;
    birthDate: string;
    websiteUrl: string;
    avatarUrl: string;
  }>>;
  setHandleFormValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProfileSection({
  profile,
  isEditingProfile,
  profileFormData,
  handleFormValue,
  isUploadingImage,
  uploadError,
  uploadSuccess,
  isPosting,
  postError,
  postSuccess,
  fileInputRef,
  onImageUpload,
  onEditProfile,
  onCancelProfileEdit,
  onProfileSubmit,
  onHandleSubmit,
  setProfileFormData,
  setHandleFormValue,
}: ProfileSectionProps) {
  if (!profile) {
    return <div style={{ padding: '1.5rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {postError && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          {postError}
        </div>
      )}

      {postSuccess && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#065f46'
        }}>
          ✅ Profile updated successfully!
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Profile</h2>
          {!isEditingProfile && (
            <button
              onClick={onEditProfile}
              style={{
                padding: '0.5rem 1rem',
                background: '#1d9bf0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Edit
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: hasValidAvatar(profileFormData.avatarUrl) ? 'transparent' : '#1d9bf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'white',
              fontWeight: 'bold',
              border: '3px solid #f0f0f0',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {hasValidAvatar(profileFormData.avatarUrl) && convertImageUrl(profileFormData.avatarUrl) ? (
                <img
                  src={convertImageUrl(profileFormData.avatarUrl)!}
                  alt={profile?.displayName || 'Profile'}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getAvatarInitial(profile?.displayName, profile?.memberName, profile?.handle)
              )}
            </div>
            {isEditingProfile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: isUploadingImage ? '#e0e0e0' : '#f0f0f0',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  color: '#333'
                }}
              >
                {isUploadingImage ? '...' : '📷'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              style={{ display: 'none' }}
            />
            {uploadError && (
              <div style={{ marginTop: '0.5rem', color: '#e74c3c', fontSize: '0.75rem' }}>
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div style={{ marginTop: '0.5rem', color: '#27ae60', fontSize: '0.75rem' }}>
                ✅ Uploaded!
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {profile.displayName}
            </h3>
            <p style={{ color: '#536471', marginBottom: '1rem' }}>@{profile.handle}</p>

            {isEditingProfile ? (
              <form onSubmit={onProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileFormData.displayName}
                    onChange={(e) => setProfileFormData({ ...profileFormData, displayName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Bio
                  </label>
                  <textarea
                    value={profileFormData.bio}
                    onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      minHeight: '80px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileFormData.location}
                    onChange={(e) => setProfileFormData({ ...profileFormData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileFormData.websiteUrl}
                    onChange={(e) => setProfileFormData({ ...profileFormData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={profileFormData.birthDate}
                    onChange={(e) => setProfileFormData({ ...profileFormData, birthDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={profileFormData.memberName}
                    onChange={(e) => setProfileFormData({ ...profileFormData, memberName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isPosting}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#1d9bf0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isPosting ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    {isPosting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelProfileEdit}
                    disabled={isPosting}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isPosting ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Display Name</label>
                  <p style={{ fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>{profile.displayName}</p>
                </div>
                {profile.bio && (
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Bio</label>
                    <p style={{ fontSize: '1rem', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Location</label>
                    <p style={{ fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>{profile.location}</p>
                  </div>
                )}
                {profile.websiteUrl && (
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Website</label>
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '1rem',
                        color: '#1d9bf0',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        display: 'block'
                      }}
                    >
                      {profile.websiteUrl}
                    </a>
                  </div>
                )}
                {profile.birthDate && (
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Birth Date</label>
                    <p style={{ fontSize: '1rem', margin: 0 }}>{profile.birthDate}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>Member Name</label>
                  <p style={{ fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>{profile.memberName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Account Settings</h2>

        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Change Handle</h3>
          <form onSubmit={onHandleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                New Handle
              </label>
              <input
                type="text"
                value={handleFormValue}
                onChange={(e) => setHandleFormValue(e.target.value)}
                placeholder="Enter new handle"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                required
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#536471' }}>
                Current handle: @{profile.handle}
              </p>
            </div>
            <button
              type="submit"
              disabled={isPosting || handleFormValue === profile.handle}
              style={{
                padding: '0.75rem',
                background: '#1d9bf0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (isPosting || handleFormValue === profile.handle) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: (isPosting || handleFormValue === profile.handle) ? 0.5 : 1
              }}
            >
              {isPosting ? 'Updating...' : 'Update Handle'}
            </button>
          </form>
        </div>

        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Change Password</h3>
          <p style={{ fontSize: '0.875rem', color: '#536471', marginBottom: '1rem' }}>
            Update your password to keep your account secure.
          </p>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Change Password
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Notification Settings</h3>
          <p style={{ fontSize: '0.875rem', color: '#536471', marginBottom: '1rem' }}>
            Manage your notification preferences.
          </p>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Manage Notifications
          </button>
        </div>
      </div>
    </div>
  );
}