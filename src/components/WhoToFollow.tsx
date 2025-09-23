'use client';

import { useState, useEffect } from 'react';
import { getRecommendedMembers, followMember, unfollowMember, RecommendedMember } from '@/lib/auth';
import styles from './WhoToFollow.module.css';

interface WhoToFollowProps {
  className?: string;
}

export default function WhoToFollow({ className }: WhoToFollowProps) {
  const [members, setMembers] = useState<RecommendedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingMembers, setFollowingMembers] = useState<Set<string>>(new Set());
  const [loadingFollowActions, setLoadingFollowActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecommendedMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching recommended members...');
        const response = await getRecommendedMembers(5);
        console.log('✅ Recommended members response:', response);
        setMembers(response.content || []);
        console.log('👥 Set members count:', response.content?.length || 0);
      } catch (err) {
        console.error('❌ Failed to fetch recommended members:', err);
        setError('팔로우 추천 목록을 불러올 수 없습니다.');
        // Keep empty array for members so UI doesn't break
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMembers();
  }, []);

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

    // Check if trying to follow self (common cause of 403)
    if (memberIdNumber === 1) { // This would need to be the actual current user's ID
      console.warn('⚠️ Cannot follow yourself');
      setError('자신을 팔로우할 수 없습니다.');
      return;
    }

    // Optimistic UI update
    const isCurrentlyFollowing = followingMembers.has(memberId);
    const newFollowingState = new Set(followingMembers);

    if (isCurrentlyFollowing) {
      newFollowingState.delete(memberId);
    } else {
      newFollowingState.add(memberId);
    }

    setFollowingMembers(newFollowingState);

    // Add loading state
    const newLoadingState = new Set(loadingFollowActions);
    newLoadingState.add(memberId);
    setLoadingFollowActions(newLoadingState);

    try {
      if (isCurrentlyFollowing) {
        console.log('🔄 Unfollowing member:', memberIdNumber);
        await unfollowMember(memberIdNumber);
        console.log('✅ Successfully unfollowed member:', memberIdNumber);
      } else {
        console.log('🔄 Following member:', memberIdNumber);
        await followMember(memberIdNumber);
        console.log('✅ Successfully followed member:', memberIdNumber);
      }
    } catch (error) {
      console.error('❌ Follow/unfollow failed:', error);
      // Revert optimistic update on error
      setFollowingMembers(followingMembers);

      // Show error message
      setError(isCurrentlyFollowing ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.');

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
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
      {members.map((member) => (
        <div key={member.id} className={styles.memberItem}>
          <div className={styles.memberAvatar}>
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.displayName} />
            ) : (
              <span>{member.displayName?.charAt(0) || member.memberName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className={styles.memberInfo}>
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
      <div className={styles.showMoreContainer}>
        <button className={styles.showMoreButton}>
          Show more
        </button>
      </div>
    </div>
  );
}