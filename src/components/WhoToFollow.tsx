'use client';

import { useState, useEffect } from 'react';
import { getRecommendedMembers, RecommendedMember } from '@/lib/auth';
import styles from './WhoToFollow.module.css';

interface WhoToFollowProps {
  className?: string;
}

export default function WhoToFollow({ className }: WhoToFollowProps) {
  const [members, setMembers] = useState<RecommendedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <button className={styles.followButton}>
            Follow
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