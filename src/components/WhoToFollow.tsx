'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRecommendedMembers, followMember, unfollowMember, RecommendedMember } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowing } from '@/contexts/FollowingContext';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import ErrorModal from './ErrorModal';
import styles from './WhoToFollow.module.css';

interface WhoToFollowProps {
  className?: string;
}

export default function WhoToFollow({ className }: WhoToFollowProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { refreshFollowing } = useFollowing();
  const router = useRouter();
  const [members, setMembers] = useState<RecommendedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);
  const [followingMembers, setFollowingMembers] = useState<Set<string>>(new Set());
  const [loadingFollowActions, setLoadingFollowActions] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecommendedMembers = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        setError(null);
        setMembers([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getRecommendedMembers(0, 10);
        setMembers(response.content || []);
        setHasMore(response.hasNext ?? !response.last);
      } catch (err) {
        setError('팔로우 추천 목록을 불러올 수 없습니다.');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMembers();
  }, [isAuthenticated, authLoading]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !isAuthenticated) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await getRecommendedMembers(nextPage, 10);

      setMembers(prev => [...prev, ...(response.content || [])]);
      setPage(nextPage);
      setHasMore(response.hasNext ?? !response.last);
    } catch (err) {
      console.error('Failed to load more members:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, isAuthenticated]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when scrolled to bottom (with 100px threshold)
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleMemberClick = (handle: string) => {
    router.push(`/${handle}`);
  };

  const handleFollowToggle = async (member: RecommendedMember) => {
    const memberId = member.id;
    const memberIdNumber = parseInt(memberId);

    if (isNaN(memberIdNumber)) {
      setError('잘못된 사용자 ID입니다.');
      return;
    }

    const currentUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : null;

    if (currentUserId && memberIdNumber === currentUserId) {
      setError('자신을 팔로우할 수 없습니다.');
      return;
    }

    // Capture the current state before any updates
    const isCurrentlyFollowing = followingMembers.has(memberId);

    // Add loading state FIRST (before optimistic update)
    const newLoadingState = new Set(loadingFollowActions);
    newLoadingState.add(memberId);
    setLoadingFollowActions(newLoadingState);

    try {
      if (isCurrentlyFollowing) {
        await unfollowMember(memberIdNumber);

        // Update state after successful API call
        const newFollowingState = new Set(followingMembers);
        newFollowingState.delete(memberId);
        setFollowingMembers(newFollowingState);

        refreshFollowing();
      } else {
        await followMember(memberIdNumber);

        // Update state after successful API call
        const newFollowingState = new Set(followingMembers);
        newFollowingState.add(memberId);
        setFollowingMembers(newFollowingState);

        refreshFollowing();

        // Remove from "Who to follow" list after 1 second
        setTimeout(() => {
          setMembers(prev => prev.filter(m => m.id !== memberId));
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.message || (isCurrentlyFollowing ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.');
      setErrorModalMessage(errorMessage);
    } finally {
      // Remove loading state
      const updatedLoadingState = new Set(loadingFollowActions);
      updatedLoadingState.delete(memberId);
      setLoadingFollowActions(updatedLoadingState);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Who to follow</div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Who to follow</div>
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>{error}</div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Who to follow</div>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyText}>추천할 사용자가 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={styles.sectionHeader}>👥 Who to follow</div>
      <div className={styles.scrollContainer} ref={containerRef}>
      {members.map((member) => (
        <div key={member.id} className={styles.memberItem}>
          <div
            className={styles.memberAvatar}
            onClick={() => handleMemberClick(member.handle)}
            style={{ cursor: 'pointer' }}
          >
            {hasValidAvatar(member.avatarUrl) && convertImageUrl(member.avatarUrl) ? (
              <img
                src={convertImageUrl(member.avatarUrl)!}
                alt={member.displayName}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span>{getAvatarInitial(member.displayName, member.memberName, member.handle)}</span>
            )}
          </div>
          <div
            className={styles.memberInfo}
            onClick={() => handleMemberClick(member.handle)}
            style={{ cursor: 'pointer' }}
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
              ? (followingMembers.has(member.id) ? '언팔로우 중...' : '팔로우 중...')
              : (followingMembers.has(member.id) ? 'Following' : 'Follow')
            }
          </button>
        </div>
      ))}
      {loadingMore && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>로딩 중...</div>
        </div>
      )}
      </div>
      {members.length > 0 && (
        <div className={styles.showMoreContainer}>
          <button
            className={styles.showMoreButton}
            onClick={() => router.push('/discover')}
          >
            Show more
          </button>
        </div>
      )}
      {errorModalMessage && (
        <ErrorModal
          message={errorModalMessage}
          onClose={() => setErrorModalMessage(null)}
        />
      )}
    </div>
  );
}