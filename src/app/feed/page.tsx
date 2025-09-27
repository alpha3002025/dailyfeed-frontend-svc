'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WhoToFollow from '@/components/WhoToFollow';
import Following from '@/components/Following';
import {
  createPost,
  getUserPosts,
  likePost,
  unlikePost,
  getFollowingTimelinePosts,
  getMostPopularPosts,
  getMostCommentedPosts,
  uploadProfileImage,
  getImageUrl
} from '@/lib/auth';
import type { Post } from '@/lib/auth';
import styles from './feed.module.css';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isLoggingOut, updateUser } = useAuth();
  // Initialize activeMenu from URL query parameter or default to 'follows'
  const menuFromUrl = searchParams.get('menu');
  const initialMenu = menuFromUrl && ['follows', 'popular', 'comments', 'feed', 'profile'].includes(menuFromUrl)
    ? menuFromUrl
    : 'follows';

  const [activeMenu, setActiveMenu] = useState(initialMenu);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingFollowingPosts, setIsLoadingFollowingPosts] = useState(false);
  const [isLoadingPopularPosts, setIsLoadingPopularPosts] = useState(false);
  const [isLoadingCommentedPosts, setIsLoadingCommentedPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [followingPostsError, setFollowingPostsError] = useState('');
  const [popularPostsError, setPopularPostsError] = useState('');
  const [commentedPostsError, setCommentedPostsError] = useState('');
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set());
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add ref to prevent duplicate fetches
  const fetchInProgress = useRef<{ [key: string]: boolean }>({});
  const lastFetchTime = useRef<{ [key: string]: number }>({});

  const menuTitles = {
    'follows': "My follow's news",
    'popular': 'Most Popular now',
    'comments': 'Most comments now',
    'feed': 'My feed',
    'profile': 'My Profile'
  };

  const handleMenuClick = (menuType: string) => {
    setActiveMenu(menuType);
    // Update URL without triggering navigation
    const newUrl = `/feed?menu=${menuType}`;
    window.history.pushState(null, '', newUrl);

    // Don't call fetch functions here - useEffect will handle it when activeMenu changes
  };

  const fetchMyPosts = async () => {
    // Prevent duplicate fetches within 500ms
    const now = Date.now();
    const lastFetch = lastFetchTime.current['feed'] || 0;
    if (now - lastFetch < 500) {
      // Skipping duplicate call - too soon
      return;
    }

    // Check if fetch is already in progress
    if (fetchInProgress.current['feed']) {
      // Skipping duplicate call - already in progress
      return;
    }

    fetchInProgress.current['feed'] = true;
    lastFetchTime.current['feed'] = now;

    setIsLoadingPosts(true);
    setPostsError('');
    try {
      const posts = await getUserPosts();
      setMyPosts(posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPostsError('글 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPosts(false);
      fetchInProgress.current['feed'] = false;
    }
  };

  const fetchFollowingPosts = async () => {
    // Prevent duplicate fetches within 500ms
    const now = Date.now();
    const lastFetch = lastFetchTime.current['follows'] || 0;
    if (now - lastFetch < 500) {
      // Skipping duplicate call - too soon
      return;
    }

    // Check if fetch is already in progress
    if (fetchInProgress.current['follows']) {
      // Skipping duplicate call - already in progress
      return;
    }

    fetchInProgress.current['follows'] = true;
    lastFetchTime.current['follows'] = now;

    setIsLoadingFollowingPosts(true);
    setFollowingPostsError('');
    try {
      const posts = await getFollowingTimelinePosts();
      setFollowingPosts(posts);
    } catch (error) {
      console.error('Failed to fetch following posts:', error);
      setFollowingPostsError('팔로잉 멤버들의 글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingFollowingPosts(false);
      fetchInProgress.current['follows'] = false;
    }
  };

  const fetchPopularPosts = async () => {
    // Prevent duplicate fetches within 500ms
    const now = Date.now();
    const lastFetch = lastFetchTime.current['popular'] || 0;
    if (now - lastFetch < 500) {
      // Skipping duplicate call - too soon
      return;
    }

    // Check if fetch is already in progress
    if (fetchInProgress.current['popular']) {
      // Skipping duplicate call - already in progress
      return;
    }

    fetchInProgress.current['popular'] = true;
    lastFetchTime.current['popular'] = now;

    setIsLoadingPopularPosts(true);
    setPopularPostsError('');
    try {
      const posts = await getMostPopularPosts();
      setPopularPosts(posts);
    } catch (error) {
      console.error('Failed to fetch popular posts:', error);
      setPopularPostsError('인기 글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPopularPosts(false);
      fetchInProgress.current['popular'] = false;
    }
  };

  const fetchCommentedPosts = async () => {
    // Prevent duplicate fetches within 500ms
    const now = Date.now();
    const lastFetch = lastFetchTime.current['comments'] || 0;
    if (now - lastFetch < 500) {
      // Skipping duplicate call - too soon
      return;
    }

    // Check if fetch is already in progress
    if (fetchInProgress.current['comments']) {
      // Skipping duplicate call - already in progress
      return;
    }

    fetchInProgress.current['comments'] = true;
    lastFetchTime.current['comments'] = now;

    setIsLoadingCommentedPosts(true);
    setCommentedPostsError('');
    try {
      const posts = await getMostCommentedPosts();
      setCommentedPosts(posts);
    } catch (error) {
      console.error('Failed to fetch most commented posts:', error);
      setCommentedPostsError('댓글 많은 글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingCommentedPosts(false);
      fetchInProgress.current['comments'] = false;
    }
  };

  // Load posts when component mounts or when activeMenu changes
  useEffect(() => {
    if (activeMenu === 'feed') {
      fetchMyPosts();
    } else if (activeMenu === 'follows') {
      fetchFollowingPosts();
    } else if (activeMenu === 'popular') {
      fetchPopularPosts();
    } else if (activeMenu === 'comments') {
      fetchCommentedPosts();
    }
  }, [activeMenu]);


  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const menu = params.get('menu');
      if (menu && ['follows', 'popular', 'comments', 'feed', 'profile'].includes(menu)) {
        setActiveMenu(menu);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      setPostError('글 내용을 입력해주세요.');
      return;
    }

    setIsPosting(true);
    setPostError('');
    setPostSuccess(false);

    try {
      await createPost(postContent.trim());
      setPostContent('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
      // Refresh my posts if currently viewing 'My feed'
      if (activeMenu === 'feed') {
        fetchMyPosts();
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      setPostError('글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleShareClick = () => {
    handlePostSubmit();
  };

  const handleLikeToggle = async (e: React.MouseEvent, post: Post, source: 'myPosts' | 'followingPosts' | 'popularPosts' | 'commentedPosts' = 'myPosts') => {
    e.stopPropagation(); // Prevent navigation to post detail
    e.preventDefault();

    if (!user || likingPostIds.has(post.id)) return;

    setLikingPostIds(prev => new Set(prev).add(post.id));

    try {
      if (post.isLiked) {
        await unlikePost(post.id);
        // Update the appropriate state based on source
        const updatePosts = (posts: Post[]) =>
          posts.map(p =>
            p.id === post.id
              ? { ...p, isLiked: false, likesCount: Math.max(0, (p.likesCount || 0) - 1) }
              : p
          );

        if (source === 'myPosts') {
          setMyPosts(updatePosts);
        } else if (source === 'followingPosts') {
          setFollowingPosts(updatePosts);
        } else if (source === 'popularPosts') {
          setPopularPosts(updatePosts);
        } else if (source === 'commentedPosts') {
          setCommentedPosts(updatePosts);
        }
      } else {
        await likePost(post.id);
        // Update the appropriate state based on source
        const updatePosts = (posts: Post[]) =>
          posts.map(p =>
            p.id === post.id
              ? { ...p, isLiked: true, likesCount: (p.likesCount || 0) + 1 }
              : p
          );

        if (source === 'myPosts') {
          setMyPosts(updatePosts);
        } else if (source === 'followingPosts') {
          setFollowingPosts(updatePosts);
        } else if (source === 'popularPosts') {
          setPopularPosts(updatePosts);
        } else if (source === 'commentedPosts') {
          setCommentedPosts(updatePosts);
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLikingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
  };

  // Reusable function for rendering posts
  const renderPostList = (
    posts: Post[],
    isLoading: boolean,
    error: string,
    emptyMessage: { icon: string; title: string; subtitle: string },
    onRetry: () => void,
    source: 'myPosts' | 'followingPosts' | 'popularPosts' | 'commentedPosts'
  ) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '방금 전' : `${minutes}분 전`;
      } else if (hours < 24) {
        return `${hours}시간 전`;
      } else if (days < 7) {
        return `${days}일 전`;
      } else {
        return date.toLocaleDateString('ko-KR');
      }
    };

    if (isLoading) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
          글 목록을 불러오는 중...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
          {error}
          <button
            onClick={onRetry}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#1d9bf0',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{emptyMessage.icon}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            {emptyMessage.title}
          </div>
          <div style={{ color: '#888' }}>
            {emptyMessage.subtitle}
          </div>
        </div>
      );
    }

    return posts.map((post) => (
      <div
        key={post.id}
        className={styles.feedItem}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.feedContent}>
          <div className={styles.avatar}>
            {source === 'myPosts' && user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span>{post.memberDisplayName?.charAt(0) || post.memberName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className={styles.feedText}>
            <div
              className={styles.feedHeader}
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <span className={styles.username}>
                {source === 'myPosts'
                  ? (user?.displayName || user?.memberName || 'Unknown User')
                  : (post.memberDisplayName || post.memberName || 'Unknown User')}
              </span>
              <span className={styles.handle}>
                @{source === 'myPosts'
                  ? (user?.handle || 'unknown')
                  : (post.memberHandle || 'unknown')}
              </span>
              <span className={styles.timestamp}>• {formatDate(post.createdAt)}</span>
            </div>
            <div
              className={styles.feedBody}
              onClick={() => router.push(`/post/${post.id}`)}
            >
              {post.content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < post.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
            <div className={styles.feedActions}>
              <div className={styles.actionBtn}>
                <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                {post.commentsCount || 0}
              </div>
              <div className={styles.actionBtn}>
                <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                {post.sharesCount || 0}
              </div>
              <div
                className={styles.actionBtn}
                onClick={(e) => handleLikeToggle(e, post, source)}
                style={{
                  cursor: 'pointer',
                  opacity: likingPostIds.has(post.id) ? 0.5 : 1,
                  color: post.isLiked ? '#e0245e' : 'inherit'
                }}
              >
                <svg viewBox="0 0 24 24" fill={post.isLiked ? '#e0245e' : 'none'}>
                  {post.isLiked ? (
                    <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                  ) : (
                    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                  )}
                </svg>
                {post.likesCount || 0}
              </div>
              <div className={styles.actionBtn}>
                <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login will be handled by ProtectedRoute
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, the user will be logged out locally
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload triggered');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    console.log('Current user:', user);
    console.log('User memberId:', user?.memberId);

    if (!file) {
      console.log('No file selected');
      return;
    }

    // Temporary: Try to extract memberId from email if not present
    let userMemberId = user?.memberId;
    if (!userMemberId && user?.email) {
      // Try to parse memberId from email pattern (e.g., case3_C@gmail.com -> 3)
      const match = user.email.match(/case(\d+)_/);
      if (match) {
        userMemberId = parseInt(match[1]);
        console.log('📌 Extracted memberId from email:', userMemberId);
      }
    }

    if (!userMemberId) {
      console.log('No user memberId available');
      setUploadError('User ID not found. Please log out and log in again.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    console.log('Starting image upload...');
    setIsUploadingImage(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      console.log('Calling uploadProfileImage with memberId:', userMemberId);
      const result = await uploadProfileImage(userMemberId, file);
      console.log('Upload result:', result);

      // Update user context with new avatar URL
      if (result.imageUrl) {
        console.log('✅ Updating user avatar with URL:', result.imageUrl);
        await updateUser({
          ...user,
          avatarUrl: result.imageUrl
        });

        // Force a re-render to immediately show the new image
        setUploadError(''); // Clear any previous errors
        setUploadSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);

        console.log('✅ Profile image uploaded and updated successfully!');
      } else {
        console.error('❌ No image URL returned from upload');
        setUploadError('Image uploaded but URL not available');
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
      {/* 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.logo}>
            <h1>Dailyfeed</h1>
          </div>

          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <a
                href="#"
                className={`${styles.navLink} ${activeMenu === 'follows' ? styles.active : ''}`}
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
                className={`${styles.navLink} ${activeMenu === 'popular' ? styles.active : ''}`}
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
                className={`${styles.navLink} ${activeMenu === 'comments' ? styles.active : ''}`}
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
                className={`${styles.navLink} ${activeMenu === 'feed' ? styles.active : ''}`}
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
                className={`${styles.navLink} ${activeMenu === 'profile' ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); handleMenuClick('profile'); }}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span className={styles.navText}>Profile</span>
              </a>
            </li>
          </ul>

          <button
            className={styles.postButton}
            onClick={() => {
              const textarea = document.querySelector(`.${styles.composeTextarea}`) as HTMLTextAreaElement;
              if (textarea) {
                textarea.focus();
                textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
            ✍️ Share thoughts
          </button>

          {/* User info and logout */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" />
                ) : (
                  <span>{user?.displayName?.charAt(0) || 'U'}</span>
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
      </nav>

      {/* 메인 컨텐츠 */}
      <main className={styles.mainContent}>
        <div className={styles.mainHeaderCard}>
          <div className={styles.mainHeader}>
            <h2>{menuTitles[activeMenu as keyof typeof menuTitles]}</h2>
          </div>
        </div>

        {/* 포스트 작성 영역 - Profile 메뉴에서는 숨김 */}
        {activeMenu !== 'profile' && (
          <div className={styles.composeCard}>
          <div className={styles.composeContent}>
            <div className={styles.avatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                <span>{user?.displayName?.charAt(0) || user?.memberName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className={styles.composeForm}>
              <textarea
                className={styles.composeTextarea}
                placeholder="What's on your mind today?"
                value={postContent}
                onChange={(e) => {
                  setPostContent(e.target.value);
                  setPostError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handlePostSubmit();
                  }
                }}
                disabled={isPosting}
                maxLength={500}
              />
              {postError && (
                <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {postError}
                </div>
              )}
              {postSuccess && (
                <div style={{ color: '#27ae60', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  ✅ 글이 성공적으로 작성되었습니다!
                </div>
              )}
              <div className={styles.composeActions}>
                <div className={styles.actionIcons}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/>
                  </svg>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.77 0 1.54-.344 2.05-.945l-1.03-.86c-.25.258-.68.43-1.02.43-.65 0-1.22-.57-1.22-1.375s.57-1.375 1.22-1.375z"/>
                  </svg>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24">
                    <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 17.5c2.33 0 4.3-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5zM12 3C6.477 3 2 7.477 2 13s4.477 10 10 10 10-4.477 10-10S17.523 3 12 3zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: postContent.length > 450 ? '#e74c3c' : '#888' }}>
                    {postContent.length}/500
                  </span>
                  <button
                    className={styles.postBtnSmall}
                    onClick={handleShareClick}
                    disabled={isPosting || !postContent.trim() || postContent.length > 500}
                    style={{
                      opacity: isPosting || !postContent.trim() || postContent.length > 500 ? 0.5 : 1,
                      cursor: isPosting || !postContent.trim() || postContent.length > 500 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isPosting ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Feed Content based on active menu */}
        <div className={styles.feedContainer}>
          {activeMenu === 'follows' && (
            <div>
              {renderPostList(
                followingPosts,
                isLoadingFollowingPosts,
                followingPostsError,
                {
                  icon: '📰',
                  title: '팔로잉하는 멤버들의 새로운 소식이 없습니다',
                  subtitle: '더 많은 사람들을 팔로우하여 타임라인을 풍성하게 만들어보세요!'
                },
                fetchFollowingPosts,
                'followingPosts'
              )}
            </div>
          )}

          {activeMenu === 'comments' && (
            <div>
              {renderPostList(
                commentedPosts,
                isLoadingCommentedPosts,
                commentedPostsError,
                {
                  icon: '💬',
                  title: '댓글이 많은 글이 없습니다',
                  subtitle: '새로운 글을 작성하고 대화를 시작해보세요!'
                },
                fetchCommentedPosts,
                'commentedPosts'
              )}
            </div>
          )}

          {false && activeMenu === 'comments' && (
            <div>
              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>💬</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Debate Central</span>
                      <span className={styles.handle}>@debatecentral</span>
                      <span className={styles.timestamp}>• 6h</span>
                    </div>
                    <div className={styles.feedBody}>
                      Should remote work be the default for all tech companies? The debate continues as companies like Apple and Google call employees back to office while others embrace permanent remote culture.
                      <br/><br/>
                      What&apos;s your take? 🤔 Office vs Remote vs Hybrid?
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        4.8K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        892
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        1.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>🎯</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Philosophy Corner</span>
                      <span className={styles.handle}>@philocorner</span>
                      <span className={styles.timestamp}>• 8h</span>
                    </div>
                    <div className={styles.feedBody}>
                      &quot;The unexamined life is not worth living.&quot; - Socrates
                      <br/><br/>
                      In our fast-paced digital age, do we still take time for deep self-reflection? Or have we become too distracted by social media, news cycles, and endless notifications?
                      <br/><br/>
                      How do you practice self-examination in 2025?
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        3.7K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        524
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        2.9K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>🎬</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Film Fanatics</span>
                      <span className={styles.handle}>@filmfanatics</span>
                      <span className={styles.timestamp}>• 3h</span>
                    </div>
                    <div className={styles.feedBody}>
                      Hot take: The Marvel Cinematic Universe peaked with Infinity War/Endgame and everything since has been a desperate attempt to recapture that magic.
                      <br/><br/>
                      The multiverse concept has become a crutch for lazy storytelling. Change my mind! 🎥🍿
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        6.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        1.3K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        3.5K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'popular' && (
            <div>
              {renderPostList(
                popularPosts,
                isLoadingPopularPosts,
                popularPostsError,
                {
                  icon: '🔥',
                  title: '인기 글이 없습니다',
                  subtitle: '감동적인 콘텐츠를 공유해보세요!'
                },
                fetchPopularPosts,
                'popularPosts'
              )}
            </div>
          )}

          {false && activeMenu === 'popular' && (
            <div>
              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>🔥</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Viral News Today</span>
                      <span className={styles.handle}>@viralnews</span>
                      <span className={styles.timestamp}>• 2h</span>
                    </div>
                    <div className={styles.feedBody}>
                      🚨 BREAKING: Major cryptocurrency exchange announces revolutionary new trading features that could change the entire digital asset landscape. Early adopters are already seeing massive returns.
                      <br/><br/>
                      This development has caught the attention of major financial institutions worldwide.
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        2.1K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        8.7K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        15.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>T</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>TechNews Daily</span>
                      <span className={styles.handle}>@technewsdaily</span>
                      <span className={styles.timestamp}>• 4h</span>
                    </div>
                    <div className={styles.feedBody}>
                      🚀 Breakthrough Alert: Revolutionary AI system achieves 95% accuracy in complex reasoning tasks, potentially transforming how we interact with artificial intelligence across all industries.
                      <br/><br/>
                      The implications for education, healthcare, and business automation are profound. This could be the breakthrough that brings us closer to truly intelligent AI assistants.
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        3.2K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        12.8K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        24.1K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>💡</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Innovation Hub</span>
                      <span className={styles.handle}>@innovationhub</span>
                      <span className={styles.timestamp}>• 5h</span>
                    </div>
                    <div className={styles.feedBody}>
                      🌟 The Future is Now: Quantum computing breakthrough allows for 1000x faster calculations in drug discovery. Major pharmaceutical companies are already investing billions to integrate this technology.
                      <br/><br/>
                      This could mean personalized medicine becomes reality within the next 3-5 years. The healthcare revolution is accelerating faster than anyone predicted.
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        1.8K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        6.3K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        18.9K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.feedItem}>
                <div className={styles.feedContent}>
                  <div className={styles.avatar}>📈</div>
                  <div className={styles.feedText}>
                    <div className={styles.feedHeader}>
                      <span className={styles.username}>Market Watch</span>
                      <span className={styles.handle}>@marketwatch</span>
                      <span className={styles.timestamp}>• 7h</span>
                    </div>
                    <div className={styles.feedBody}>
                      📊 BREAKING: Global markets surge as major economies report strongest growth in decade. Tech stocks leading the rally with unprecedented gains.
                      <br/><br/>
                      Analysts predict this could be the beginning of a new economic golden age, driven by AI productivity gains and green energy transition. Investors are calling it the &quot;Great Acceleration.&quot;
                    </div>
                    <div className={styles.feedActions}>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                        2.9K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                        9.4K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                        21.7K
                      </div>
                      <div className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'feed' && (
            <div>
              {isLoadingPosts && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
                  글 목록을 불러오는 중...
                </div>
              )}

              {postsError && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                  {postsError}
                  <button
                    onClick={fetchMyPosts}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#1d9bf0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!isLoadingPosts && !postsError && myPosts.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    아직 작성한 글이 없습니다
                  </div>
                  <div style={{ color: '#888' }}>
                    첫 게시글을 작성해보세요!
                  </div>
                </div>
              )}

              {!isLoadingPosts && !postsError && myPosts.map((post) => {
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString);
                  const now = new Date();
                  const diff = now.getTime() - date.getTime();
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const days = Math.floor(hours / 24);

                  if (hours < 1) {
                    const minutes = Math.floor(diff / (1000 * 60));
                    return minutes <= 1 ? '방금 전' : `${minutes}분 전`;
                  } else if (hours < 24) {
                    return `${hours}시간 전`;
                  } else if (days < 7) {
                    return `${days}일 전`;
                  } else {
                    return date.toLocaleDateString('ko-KR');
                  }
                };

                return (
                  <div
                    key={post.id}
                    className={styles.feedItem}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.feedContent}>
                      <div className={styles.avatar}>
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt="Profile"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <span>{user?.displayName?.charAt(0) || user?.memberName?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className={styles.feedText}>
                        <div
                          className={styles.feedHeader}
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          <span className={styles.username}>
                            {user?.displayName || user?.memberName || 'Unknown User'}
                          </span>
                          <span className={styles.handle}>@{user?.handle || 'unknown'}</span>
                          <span className={styles.timestamp}>• {formatDate(post.createdAt)}</span>
                        </div>
                        <div
                          className={styles.feedBody}
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          {post.content.split('\n').map((line, index) => (
                            <span key={index}>
                              {line}
                              {index < post.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                        <div className={styles.feedActions}>
                          <div className={styles.actionBtn}>
                            <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                            {post.commentsCount || 0}
                          </div>
                          <div className={styles.actionBtn}>
                            <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
                            {post.sharesCount || 0}
                          </div>
                          <div
                            className={styles.actionBtn}
                            onClick={(e) => handleLikeToggle(e, post, 'myPosts')}
                            style={{
                              cursor: 'pointer',
                              opacity: likingPostIds.has(post.id) ? 0.5 : 1,
                              color: post.isLiked ? '#e0245e' : 'inherit'
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill={post.isLiked ? '#e0245e' : 'none'}>
                              {post.isLiked ? (
                                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                              ) : (
                                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                              )}
                            </svg>
                            {post.likesCount || 0}
                          </div>
                          <div className={styles.actionBtn}>
                            <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeMenu === 'profile' && (
            <div style={{ padding: '1.5rem' }}>
              {/* Profile Header */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  {/* Profile Image Section */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : undefined,
                      backgroundColor: user?.avatarUrl ? 'transparent' : '#1d9bf0',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      color: 'white',
                      fontWeight: 'bold',
                      border: '3px solid #f0f0f0'
                    }}>
                      {!user?.avatarUrl && (user?.displayName?.charAt(0) || user?.memberName?.charAt(0) || 'U')}
                    </div>
                    <button
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: isUploadingImage ? '#e0e0e0' : '#f0f0f0',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        color: '#333',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? '⏳ Uploading...' : '📷 Change Photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    {uploadError && (
                      <div style={{
                        marginTop: '0.5rem',
                        color: '#e74c3c',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                      }}>
                        {uploadError}
                      </div>
                    )}
                    {uploadSuccess && (
                      <div style={{
                        marginTop: '0.5rem',
                        color: '#27ae60',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                      }}>
                        ✅ Image uploaded successfully!
                      </div>
                    )}
                  </div>

                  {/* Profile Info Section */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                      {user?.displayName || user?.memberName || 'Unknown User'}
                    </h2>
                    <p style={{ color: '#536471', fontSize: '1rem', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
                      @{user?.handle || 'unknown'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>
                          Email
                        </label>
                        <p style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                          title: user?.email || 'No email provided'
                        }}>
                          {user?.email || 'No email provided'}
                        </p>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>
                          Member ID
                        </label>
                        <p style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                          title: `#${user?.memberId || 'N/A'}`
                        }}>
                          #{user?.memberId || 'N/A'}
                        </p>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>
                          Followers
                        </label>
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                          {user?.followersCount || 0}
                        </p>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '0.875rem', color: '#536471', display: 'block', marginBottom: '0.25rem' }}>
                          Following
                        </label>
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                          {user?.followingCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                  Account Settings
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      fontSize: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                    disabled
                  >
                    <span>✏️ Edit Profile</span>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Coming soon</span>
                  </button>

                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      fontSize: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                    disabled
                  >
                    <span>🔐 Change Password</span>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Coming soon</span>
                  </button>

                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      fontSize: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                    disabled
                  >
                    <span>🔔 Notification Settings</span>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Coming soon</span>
                  </button>

                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      fontSize: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                    disabled
                  >
                    <span>🎨 Theme Settings</span>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Coming soon</span>
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                  Account Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#536471' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Account Type</span>
                    <span style={{ fontWeight: '500', color: '#000' }}>Standard</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Member Since</span>
                    <span style={{ fontWeight: '500', color: '#000' }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Last Login</span>
                    <span style={{ fontWeight: '500', color: '#000' }}>
                      {new Date().toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Account Status</span>
                    <span style={{ fontWeight: '500', color: '#22c55e' }}>✅ Active</span>
                  </div>
                </div>

                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                    opacity: isLoggingOut ? 0.7 : 1
                  }}
                >
                  {isLoggingOut ? '로그아웃 중...' : '🚪 로그아웃'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 오른쪽 사이드바 */}
      <aside className={styles.rightSidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputContainer}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24">
                <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
              </svg>
              <input type="text" className={styles.searchInput} placeholder="Search Dailyfeed" />
            </div>
          </div>
        </div>

        <Following className={styles.sidebarSection} />

        <WhoToFollow className={styles.sidebarSection} />
      </aside>
      </div>
    </div>
  );
}