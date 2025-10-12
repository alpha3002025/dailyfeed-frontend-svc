'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowing } from '@/contexts/FollowingContext';
import Following from '@/components/Following';
import WhoToFollow from '@/components/WhoToFollow';
import {
  getRecommendedMembers,
  followMember,
  type RecommendedMember
} from '@/lib/auth';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import styles from './discover.module.css';

export default function DiscoverPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { refreshFollowing } = useFollowing();
  const router = useRouter();

  const [members, setMembers] = useState<RecommendedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [followingMembers, setFollowingMembers] = useState<Set<string>>(new Set());
  const [loadingFollowActions, setLoadingFollowActions] = useState<Set<string>>(new Set());
  const [followedMembers, setFollowedMembers] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      console.log('📦 Container info:', {
        scrollHeight,
        clientHeight,
        isScrollable: scrollHeight > clientHeight,
        membersCount: members.length
      });
    }
  }, [members]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecommendedMembers(0, 20);
      console.log('✅ Initial members response:', response);
      setMembers(response.content || []);
      setHasMore(response.hasNext ?? !response.last);
      setPage(0);
      console.log('📊 Initial - Has more:', response.hasNext, 'Last:', response.last);
    } catch (err: any) {
      setError(err.message || '추천 멤버를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMembers = async () => {
    if (loadingMore || !hasMore) {
      console.log('⏭️ Skipping loadMore:', { loadingMore, hasMore });
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      console.log('🔄 Loading more members, page:', nextPage);
      const response = await getRecommendedMembers(nextPage, 20);
      console.log('✅ More members loaded:', response);

      if (response.content && response.content.length > 0) {
        setMembers(prev => [...prev, ...response.content]);
        setPage(nextPage);
        setHasMore(response.hasNext ?? !response.last);
        console.log('📊 Updated - Has more:', response.hasNext, 'Last:', response.last);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more members:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const bottom = scrollHeight - scrollTop <= clientHeight + 50;

    console.log('📜 Scroll event:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      bottom,
      hasMore,
      loadingMore
    });

    if (bottom) {
      console.log('🎯 Bottom reached, calling loadMoreMembers');
      loadMoreMembers();
    }
  };

  const handleMemberClick = (handle: string) => {
    router.push(`/${handle}`);
  };

  const handleFollowToggle = async (member: RecommendedMember) => {
    console.log('🎯 Follow toggle clicked for member:', member);
    const memberId = member.id;
    const memberIdNumber = parseInt(memberId);

    console.log('🔢 Member ID conversion:', {
      originalId: memberId,
      convertedId: memberIdNumber,
      isValid: !isNaN(memberIdNumber)
    });

    if (isNaN(memberIdNumber)) {
      console.error('❌ Invalid member ID:', memberId);
      setError('잘못된 사용자 ID입니다.');
      return;
    }

    const currentUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : null;

    console.log('👤 Current user check:', {
      currentUserId,
      memberIdNumber,
      userObject: user
    });

    if (currentUserId && memberIdNumber === currentUserId) {
      console.warn('⚠️ Cannot follow yourself');
      setError('자신을 팔로우할 수 없습니다.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const isCurrentlyFollowing = followingMembers.has(memberId);
    const newFollowingState = new Set(followingMembers);

    if (isCurrentlyFollowing) {
      newFollowingState.delete(memberId);
    } else {
      newFollowingState.add(memberId);
    }

    setFollowingMembers(newFollowingState);

    const newLoadingState = new Set(loadingFollowActions);
    newLoadingState.add(memberId);
    setLoadingFollowActions(newLoadingState);

    try {
      console.log('🔄 Following member:', memberIdNumber);
      await followMember(memberIdNumber);
      console.log('✅ Successfully followed member:', memberIdNumber);

      setFollowedMembers(prev => new Set([...prev, memberId]));

      setMembers(prev => prev.filter(m => m.id !== memberId));

      refreshFollowing();
    } catch (error) {
      console.error('❌ Follow failed:', error);
      setFollowingMembers(followingMembers);

      setError('팔로우에 실패했습니다.');
      setTimeout(() => setError(null), 3000);
    } finally {
      const updatedLoadingState = new Set(loadingFollowActions);
      updatedLoadingState.delete(memberId);
      setLoadingFollowActions(updatedLoadingState);
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

  const displayMembers = members.filter(m => !followedMembers.has(m.id));

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
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

        <div className={styles.mainContent}>
          <div className={styles.mainHeaderCard}>
            <div className={styles.mainHeader}>
              <h2>👥 Who to follow</h2>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div
            className={styles.listContainer}
            onScroll={handleScroll}
            ref={scrollContainerRef}
            onLoad={() => console.log('✅ Container loaded')}
          >
            {displayMembers.length === 0 && !loadingMore ? (
              <div className={styles.emptyState}>
                <p>추천할 사용자가 없습니다.</p>
              </div>
            ) : (
              <>
                {displayMembers.map((member) => (
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
                      className={`${styles.followButton} ${
                        followingMembers.has(member.id) ? styles.followingButton : ''
                      }`}
                      onClick={() => handleFollowToggle(member)}
                      disabled={loadingFollowActions.has(member.id)}
                    >
                      {loadingFollowActions.has(member.id)
                        ? '팔로우 중...'
                        : (followingMembers.has(member.id) ? 'Following' : 'Follow')
                      }
                    </button>
                  </div>
                ))}
                {loadingMore && (
                  <div className={styles.loadingMore}>더 불러오는 중...</div>
                )}
                {!hasMore && displayMembers.length > 0 && (
                  <div className={styles.endMessage}>모든 추천 목록을 불러왔습니다.</div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className={styles.rightSidebar}>
          <Following className={styles.sidebarSection} />
          <WhoToFollow className={styles.sidebarSection} />
        </aside>
      </div>
    </div>
  );
}