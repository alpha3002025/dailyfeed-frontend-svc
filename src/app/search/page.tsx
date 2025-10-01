'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { searchPosts, likePost, unlikePost, type Post } from '@/lib/auth';
import PostCard from '@/components/PostCard';
import Following from '@/components/Following';
import WhoToFollow from '@/components/WhoToFollow';
import { hasValidAvatar, getAvatarInitial } from '@/utils/avatarUtils';
import styles from './search.module.css';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const { user, logout, isLoggingOut, isAuthenticated, isLoading: authLoading } = useAuth();

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = (menu: string) => {
    router.push(`/feed?menu=${menu}`);
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
          <div className={styles.sidebarCard}>
            <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              <h1>Dailyfeed</h1>
            </div>

            <ul className={styles.navMenu}>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={styles.navLink}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('follows'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
                    <path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684L22.054 12l-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z"/>
                  </svg>
                  <span className={styles.navText}>My follow&apos;s news</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={styles.navLink}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('popular'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"/>
                  </svg>
                  <span className={styles.navText}>Most Popular now</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={styles.navLink}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('comments'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                  </svg>
                  <span className={styles.navText}>Most comments now</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={styles.navLink}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('feed'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.47V21zm16.057-1.027c-.184-6.618-3.736-8.977-7-8.977s-6.816 2.358-7 8.977L9.498 21h14.029v-1.027zm-7-6.972c-2.767 0-4.57 2.223-4.938 6.004h9.875c-.367-3.781-2.17-6.004-4.938-6.004zM7.471 6.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM16.5 10.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm3.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                  </svg>
                  <span className={styles.navText}>My feed</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="#"
                  className={styles.navLink}
                  onClick={(e) => { e.preventDefault(); handleMenuClick('profile'); }}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  <span className={styles.navText}>Profile</span>
                </a>
              </li>
              <li className={styles.navItem}>
                <a
                  href="/connections"
                  className={styles.navLink}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  <span className={styles.navText}>Connections</span>
                </a>
              </li>
            </ul>

            <button
              className={styles.postButton}
              onClick={() => router.push('/feed')}
            >
              ✍️ Share thoughts
            </button>

            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {hasValidAvatar(user?.avatarUrl) ? (
                    <img src={user?.avatarUrl || ''} alt="Profile" />
                  ) : (
                    <span>{getAvatarInitial(user?.displayName, user?.memberName, user?.handle)}</span>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{user?.displayName || user?.memberName}</div>
                  <div className={styles.userHandle}>@{user?.handle}</div>
                </div>
              </div>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
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