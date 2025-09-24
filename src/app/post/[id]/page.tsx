'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostDetail, getPostComments } from '@/lib/auth';
import type { PostDetail, Comment } from '@/lib/auth';
import styles from './postDetail.module.css';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [postError, setPostError] = useState('');
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
      fetchComments();
    }
  }, [postId]);

  const fetchPostDetail = async () => {
    setIsLoadingPost(true);
    setPostError('');
    try {
      const postData = await getPostDetail(postId);
      setPost(postData);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      setPostError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setCommentsError('');
    try {
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setCommentsError('댓글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingComments(false);
    }
  };

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

  const handleBackClick = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, navigate to My Feed page with the feed menu active
      router.push('/feed?menu=feed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBackClick} className={styles.backButton}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"/>
          </svg>
          <span>뒤로</span>
        </button>
        <h1 className={styles.title}>게시글</h1>
      </div>

      <div className={styles.content}>
        {/* Post Detail Section */}
        {isLoadingPost ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>게시글을 불러오는 중...</p>
          </div>
        ) : postError ? (
          <div className={styles.error}>
            <p>{postError}</p>
            <button onClick={fetchPostDetail} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        ) : post ? (
          <article className={styles.postDetail}>
            <div className={styles.postHeader}>
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>
                  {post.memberAvatarUrl ? (
                    <img src={post.memberAvatarUrl} alt={post.memberDisplayName || post.memberName} />
                  ) : (
                    <span>{(post.memberDisplayName || post.memberName || 'U').charAt(0)}</span>
                  )}
                </div>
                <div className={styles.authorMeta}>
                  <div className={styles.authorName}>
                    {post.memberDisplayName || post.memberName || 'Unknown User'}
                  </div>
                  <div className={styles.authorHandle}>
                    @{post.memberHandle || 'unknown'} · {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.postContent}>
              {post.content.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>

            <div className={styles.postStats}>
              <div className={styles.statItem}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                </svg>
                <span>{post.commentsCount || 0} 댓글</span>
              </div>
              <div className={styles.statItem}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/>
                </svg>
                <span>{post.sharesCount || 0} 공유</span>
              </div>
              <div className={styles.statItem}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                </svg>
                <span>{post.likesCount || 0} 좋아요</span>
              </div>
            </div>
          </article>
        ) : null}

        {/* Comments Section */}
        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>댓글 {comments.length}개</h2>

          {isLoadingComments ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>댓글을 불러오는 중...</p>
            </div>
          ) : commentsError ? (
            <div className={styles.error}>
              <p>{commentsError}</p>
              <button onClick={fetchComments} className={styles.retryButton}>
                다시 시도
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className={styles.noComments}>
              <p>아직 댓글이 없습니다.</p>
              <p className={styles.subText}>첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {comment.memberAvatarUrl ? (
                      <img src={comment.memberAvatarUrl} alt={comment.memberDisplayName || comment.memberName} />
                    ) : (
                      <span>{(comment.memberDisplayName || comment.memberName || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>
                        {comment.memberDisplayName || comment.memberName || 'Unknown User'}
                      </span>
                      <span className={styles.commentHandle}>
                        @{comment.memberHandle || 'unknown'}
                      </span>
                      <span className={styles.commentTime}>
                        · {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className={styles.commentText}>
                      {comment.content.split('\n').map((line, index) => (
                        <p key={index}>{line || '\u00A0'}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}