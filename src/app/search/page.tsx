'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { searchPosts, likePost, unlikePost, type Post } from '@/lib/auth';
import PostCard from '@/components/PostCard';
import Following from '@/components/Following';
import WhoToFollow from '@/components/WhoToFollow';
import styles from './search.module.css';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (keyword && isAuthenticated) {
      handleSearch();
    }
  }, [keyword, isAuthenticated, authLoading]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const results = await searchPosts(keyword);
      setPosts(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeToggle = async (postId: number) => {
    if (likingPostIds.has(postId)) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setLikingPostIds(prev => new Set([...prev, postId]));

    try {
      if (post.isLiked) {
        await unlikePost(postId);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? { ...p, isLiked: false, likesCount: (p.likesCount || 1) - 1 }
              : p
          )
        );
      } else {
        await likePost(postId);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? { ...p, isLiked: true, likesCount: (p.likesCount || 0) + 1 }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLikingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 왼쪽 사이드바 */}
        <aside className={styles.leftSidebar}>
          <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <h1>Dailyfeed</h1>
          </div>
          <button
            className={styles.backButton}
            onClick={() => router.push('/feed')}
          >
            ← 피드로 돌아가기
          </button>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className={styles.mainContent}>
          <div className={styles.searchHeader}>
            <h1 className={styles.searchTitle}>
              "{keyword}" 검색 결과
            </h1>
          </div>

          {isLoading && (
            <div className={styles.loadingMessage}>
              <div>검색 중...</div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && keyword && (
            <div className={styles.emptyMessage}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>검색 결과가 없습니다</div>
              <div className={styles.emptySubtitle}>
                다른 검색어로 다시 시도해보세요.
              </div>
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsCount}>
                {posts.length}개의 게시글을 찾았습니다
              </div>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikeToggle}
                  isLiking={likingPostIds.has(post.id)}
                />
              ))}
            </div>
          )}
        </main>

        {/* 오른쪽 사이드바 */}
        <aside className={styles.rightSidebar}>
          <Following className={styles.sidebarSection} />
          <WhoToFollow className={styles.sidebarSection} />
        </aside>
      </div>
    </div>
  );
}