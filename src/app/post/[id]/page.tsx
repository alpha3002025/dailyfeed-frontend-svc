'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostDetail, getPostComments, likePost, unlikePost, createComment, updateComment, deleteComment } from '@/lib/auth';
import type { Post, PostDetail, Comment } from '@/lib/auth';
import PostCard from '@/components/PostCard';
import CommentForm from '@/components/CommentForm';
import CommentItem from '@/components/CommentItem';
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
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (postId && !isNaN(postId)) {
      fetchPostDetail();
      fetchComments();
    } else {
      setPostError('잘못된 게시글 ID입니다.');
      setIsLoadingPost(false);
      setIsLoadingComments(false);
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

  const handleCreateComment = async (content: string) => {
    try {
      const newComment = await createComment(postId, content);
      setComments([newComment, ...comments]);
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    try {
      const updatedComment = await updateComment(commentId, content);
      setComments(comments.map(comment =>
        comment.id === commentId ? { ...comment, content: updatedComment.content, updatedAt: updatedComment.updatedAt } : comment
      ));
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !post || isLiking) return;

    setIsLiking(true);
    try {
      if (post.isLiked) {
        await unlikePost(postId);
        setPost({
          ...post,
          isLiked: false,
          likesCount: Math.max(0, (post.likesCount || 0) - 1)
        });
      } else {
        await likePost(postId);
        setPost({
          ...post,
          isLiked: true,
          likesCount: (post.likesCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLiking(false);
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
          <PostCard
            post={post as Post}
            onLike={handleLikeToggle}
            isLiking={isLiking}
          />
        ) : null}

        {/* Comments Section */}
        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>댓글 {comments.length}개</h2>

          {/* Comment Input Form */}
          {user && !isLoadingPost && post && (
            <CommentForm onSubmit={handleCreateComment} />
          )}

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
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}