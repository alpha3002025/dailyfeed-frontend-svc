'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMemberProfile, type AuthUser } from '@/lib/auth';
import styles from './member-profile.module.css';

export default function MemberProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const handle = params.handle as string;

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && handle) {
      loadProfile();
    }
  }, [isAuthenticated, handle]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
      const profileData = await getMemberProfile(cleanHandle);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || '프로필을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingText}>로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorText}>{error}</div>
            <button
              onClick={() => router.back()}
              className={styles.backButton}
            >
              ← 뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 왼쪽 사이드바 */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.logo}>
              <h1>Dailyfeed</h1>
            </div>
            <div className={styles.sidebarContent}>
              <button
                onClick={() => router.push('/feed')}
                className={styles.homeButton}
              >
                ← Back to Feed
              </button>
            </div>
          </div>
        </nav>

        {/* 메인 컨텐츠 */}
        <div className={styles.mainContent}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            ← 뒤로 가기
          </button>

          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span className={styles.avatarInitial}>
                      {profile.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <h1 className={styles.displayName}>{profile.displayName}</h1>
                <p className={styles.handle}>@{profile.handle}</p>
                {(profile.followersCount !== undefined || profile.followingCount !== undefined) && (
                  <div className={styles.stats}>
                    {profile.followersCount !== undefined && (
                      <span className={styles.stat}>
                        <strong>{profile.followersCount.toLocaleString()}</strong> followers
                      </span>
                    )}
                    {profile.followingCount !== undefined && (
                      <span className={styles.stat}>
                        <strong>{profile.followingCount.toLocaleString()}</strong> following
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.profileDetails}>
              {profile.bio && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Bio</label>
                  <p className={styles.detailValue}>{profile.bio}</p>
                </div>
              )}
              {profile.location && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Location</label>
                  <p className={styles.detailValue}>{profile.location}</p>
                </div>
              )}
              {profile.websiteUrl && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Website</label>
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {profile.websiteUrl}
                  </a>
                </div>
              )}
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Member Name</label>
                <p className={styles.detailValue}>{profile.memberName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 - 선택사항 */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>Profile Info</div>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Viewing profile for @{profile.handle}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}