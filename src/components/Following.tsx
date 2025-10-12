'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFollowersFollowings, unfollowMember, FollowingMember } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowing } from '@/contexts/FollowingContext';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import styles from './Following.module.css';

interface FollowingProps {
  className?: string;
}

export default function Following({ className }: FollowingProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { followingRefreshKey } = useFollowing();
  const router = useRouter();
  const [followingMembers, setFollowingMembers] = useState<FollowingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfollowingMembers, setUnfollowingMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFollowingMembers = async () => {
      console.log('🔍 Following useEffect triggered:', {
        authLoading,
        isAuthenticated,
        timestamp: new Date().toISOString()
      });

      // Don't fetch if not authenticated or auth is still loading
      if (authLoading) {
        console.log('⏳ Auth still loading, waiting...');
        return;
      }

      if (!isAuthenticated) {
        console.log('❌ Not authenticated, skipping following members fetch');
        setLoading(false);
        setError(null);
        setFollowingMembers([]);
        return;
      }

      console.log('✅ Authenticated, proceeding with API call');

      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching following members...');
        const { followings } = await getFollowersFollowings();
        console.log('✅ Following members response:', followings);
        setFollowingMembers(followings);
        console.log('👥 Set following members count:', followings.length);
      } catch (err) {
        console.error('❌ Failed to fetch following members:', err);
        setError('팔로잉 목록을 불러올 수 없습니다.');
        setFollowingMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingMembers();
  }, [isAuthenticated, authLoading, followingRefreshKey]);

  const handleMemberClick = (handle: string) => {
    router.push(`/${handle}`);
  };

  const handleUnfollow = async (member: FollowingMember) => {
    const memberId = member.id;
    const memberIdNumber = parseInt(memberId);

    if (isNaN(memberIdNumber)) {
      console.error('❌ Invalid member ID:', memberId);
      setError('잘못된 사용자 ID입니다.');
      return;
    }

    // Add loading state
    const newUnfollowingState = new Set(unfollowingMembers);
    newUnfollowingState.add(memberId);
    setUnfollowingMembers(newUnfollowingState);

    try {
      console.log('🔄 Unfollowing member:', memberIdNumber);
      await unfollowMember(memberIdNumber);
      console.log('✅ Successfully unfollowed member:', memberIdNumber);

      // Remove from list after successful unfollow
      setFollowingMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('❌ Unfollow failed:', error);
      setError('언팔로우에 실패했습니다.');

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      // Remove loading state
      const updatedUnfollowingState = new Set(unfollowingMembers);
      updatedUnfollowingState.delete(memberId);
      setUnfollowingMembers(updatedUnfollowingState);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Following</div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Following</div>
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>{error}</div>
        </div>
      </div>
    );
  }

  if (followingMembers.length === 0) {
    return (
      <div className={className}>
        <div className={styles.sectionHeader}>👥 Following</div>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyText}>팔로우 중인 사용자가 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={styles.sectionHeader}>👥 Following</div>
      {followingMembers.map((member) => (
        <div key={member.id} className={styles.followingItem}>
          <div
            className={styles.memberAvatar}
            onClick={() => handleMemberClick(member.handle)}
            style={{ cursor: 'pointer' }}
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
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.memberName}>
              {member.displayName || member.memberName}
            </div>
            <div className={styles.memberHandle}>@{member.handle}</div>
            {member.followersCount !== undefined && (
              <div className={styles.followersCount}>
                {member.followersCount.toLocaleString()} followers
              </div>
            )}
          </div>
          <button
            className={styles.unfollowButton}
            onClick={() => handleUnfollow(member)}
            disabled={unfollowingMembers.has(member.id)}
          >
            {unfollowingMembers.has(member.id) ? '언팔로우 중...' : 'Unfollow'}
          </button>
        </div>
      ))}
    </div>
  );
}