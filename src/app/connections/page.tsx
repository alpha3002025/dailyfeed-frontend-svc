'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFollowersFollowings,
  getMoreFollowers,
  getMoreFollowings,
  unfollowMember,
  followMember,
  type FollowingMember
} from '@/lib/auth';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import styles from './connections.module.css';

type TabType = 'followers' | 'followings';

export default function ConnectionsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('followers');
  const [followers, setFollowers] = useState<FollowingMember[]>([]);
  const [followings, setFollowings] = useState<FollowingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [followersPage, setFollowersPage] = useState(0);
  const [followingsPage, setFollowingsPage] = useState(0);
  const [followersHasMore, setFollowersHasMore] = useState(true);
  const [followingsHasMore, setFollowingsHasMore] = useState(true);

  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { followers: initialFollowers, followings: initialFollowings } = await getFollowersFollowings(0, 10);
      setFollowers(initialFollowers);
      setFollowings(initialFollowings);
      setFollowersHasMore(initialFollowers.length >= 10);
      setFollowingsHasMore(initialFollowings.length >= 10);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFollowers = async () => {
    if (loadingMore || !followersHasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = followersPage + 1;
      const { followers: moreFollowers } = await getMoreFollowers(nextPage, 10);

      if (moreFollowers.length > 0) {
        setFollowers(prev => [...prev, ...moreFollowers]);
        setFollowersPage(nextPage);
        setFollowersHasMore(moreFollowers.length >= 10);
      } else {
        setFollowersHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more followers:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreFollowings = async () => {
    if (loadingMore || !followingsHasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = followingsPage + 1;
      const { followings: moreFollowings } = await getMoreFollowings(nextPage, 10);

      if (moreFollowings.length > 0) {
        setFollowings(prev => [...prev, ...moreFollowings]);
        setFollowingsPage(nextPage);
        setFollowingsHasMore(moreFollowings.length >= 10);
      } else {
        setFollowingsHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more followings:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (bottom) {
      if (activeTab === 'followers') {
        loadMoreFollowers();
      } else {
        loadMoreFollowings();
      }
    }
  };

  const handleMemberClick = (handle: string) => {
    router.push(`/${handle}`);
  };

  const handleFollowToggle = async (member: FollowingMember, isCurrentlyFollowing: boolean) => {
    const memberId = member.id;
    const memberIdNumber = parseInt(memberId);

    if (isNaN(memberIdNumber)) {
      console.error('Invalid member ID:', memberId);
      return;
    }

    const newActionLoading = new Set(actionLoading);
    newActionLoading.add(memberId);
    setActionLoading(newActionLoading);

    try {
      if (isCurrentlyFollowing) {
        await unfollowMember(memberIdNumber);
        setFollowings(prev => prev.filter(m => m.id !== memberId));
      } else {
        await followMember(memberIdNumber);
      }
    } catch (error) {
      console.error('Follow/unfollow failed:', error);
      setError(isCurrentlyFollowing ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.');
      setTimeout(() => setError(null), 3000);
    } finally {
      const updatedActionLoading = new Set(actionLoading);
      updatedActionLoading.delete(memberId);
      setActionLoading(updatedActionLoading);
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

  const currentList = activeTab === 'followers' ? followers : followings;
  const hasMore = activeTab === 'followers' ? followersHasMore : followingsHasMore;

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
          <div className={styles.mainHeaderCard}>
            <div className={styles.mainHeader}>
              <h2>Connections</h2>
            </div>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'followers' ? styles.active : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                Followers ({followers.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'followings' ? styles.active : ''}`}
                onClick={() => setActiveTab('followings')}
              >
                Following ({followings.length})
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div
            className={styles.listContainer}
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            {currentList.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{activeTab === 'followers' ? '팔로워가 없습니다.' : '팔로잉 중인 사용자가 없습니다.'}</p>
              </div>
            ) : (
              <>
                {currentList.map((member) => {
                  const isFollowing = activeTab === 'followings';
                  return (
                    <div key={member.id} className={styles.memberCard}>
                      <div
                        className={styles.memberAvatar}
                        onClick={() => handleMemberClick(member.handle)}
                      >
                        {hasValidAvatar(member.avatarUrl) && convertImageUrl(member.avatarUrl) ? (
                          <img src={convertImageUrl(member.avatarUrl)!} alt={member.displayName} />
                        ) : (
                          <span>{getAvatarInitial(member.displayName, member.memberName, member.handle)}</span>
                        )}
                      </div>
                      <div
                        className={styles.memberInfo}
                        onClick={() => handleMemberClick(member.handle)}
                      >
                        <div className={styles.memberName}>
                          {member.displayName || member.memberName}
                        </div>
                        <div className={styles.memberHandle}>@{member.handle}</div>
                        {member.bio && (
                          <div className={styles.memberBio}>{member.bio}</div>
                        )}
                        {member.followersCount !== undefined && (
                          <div className={styles.followersCount}>
                            {member.followersCount.toLocaleString()} followers
                          </div>
                        )}
                      </div>
                      <button
                        className={`${styles.actionButton} ${isFollowing ? styles.unfollowButton : styles.followButton}`}
                        onClick={() => handleFollowToggle(member, isFollowing)}
                        disabled={actionLoading.has(member.id)}
                      >
                        {actionLoading.has(member.id)
                          ? (isFollowing ? '처리 중...' : '처리 중...')
                          : (isFollowing ? 'Unfollow' : 'Follow Back')
                        }
                      </button>
                    </div>
                  );
                })}
                {loadingMore && (
                  <div className={styles.loadingMore}>더 불러오는 중...</div>
                )}
                {!hasMore && currentList.length > 0 && (
                  <div className={styles.endMessage}>모든 목록을 불러왔습니다.</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>Info</div>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                {activeTab === 'followers'
                  ? '나를 팔로우하는 사용자들입니다.'
                  : '내가 팔로우하는 사용자들입니다.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}