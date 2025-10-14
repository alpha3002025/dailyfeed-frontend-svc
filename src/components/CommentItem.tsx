'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import { likeComment, unlikeComment, getCommentDetail, getCommentReplies, createReply } from '@/lib/auth';
import type { Comment } from '@/lib/auth';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
  postId: number; // Always pass postId explicitly
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onReplyDeleted?: () => Promise<void>;
  isReply?: boolean; // Flag to indicate if this is a reply (nested comment)
}

export default function CommentItem({ comment, postId, onUpdate, onDelete, onReplyDeleted, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);

  // Convert user.id to number for comparison since it might be a string
  const userId = user?.id ? Number(user.id) : null;

  // Check ownership by ID or by handle (fallback for temp-id cases)
  const isOwner = (userId !== null && !isNaN(userId) && (userId === comment.memberId || userId === comment.authorId)) ||
                  (user?.handle && (user.handle === comment.memberHandle || user.handle === comment.authorHandle));

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

  const handleUpdate = async () => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);

      // Fetch updated comment detail to show the latest data
      console.log('🔄 Fetching updated comment detail after edit...');
      const updatedComment = await getCommentDetail(comment.id);
      console.log('✅ Updated comment detail fetched:', updatedComment);

      // Update local state with fresh data from server
      setEditContent(updatedComment.content);
      setLikeCount(updatedComment.likeCount || 0);
      setReplyCount(updatedComment.replyCount || 0);

      // If this comment has a parent (is a reply), notify parent to refresh
      if (onReplyDeleted) {
        await onReplyDeleted();
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDelete(comment.id);
      setShowDeleteConfirm(false);

      // If this is a reply and there's a callback, notify parent to refresh replies
      if (onReplyDeleted) {
        await onReplyDeleted();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleLikeToggle = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      if (isLiked) {
        console.log('💔 Unliking comment:', comment.id);
        await unlikeComment(comment.id);
      } else {
        console.log('❤️ Liking comment:', comment.id);
        await likeComment(comment.id);
      }

      // Fetch updated comment detail after successful like/unlike
      console.log('🔄 Fetching updated comment detail...');
      const updatedComment = await getCommentDetail(comment.id);
      console.log('✅ Updated comment detail:', updatedComment);

      // Update local state with fresh data from server
      setIsLiked(!isLiked);
      setLikeCount(updatedComment.likeCount || 0);
      setReplyCount(updatedComment.replyCount || 0);
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      // Could show error toast/modal here if needed
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleToggleReplies = async () => {
    if (showReplies) {
      // Close replies and reply form
      setShowReplies(false);
      setShowReplyForm(false);
      setCurrentPage(0);
      setReplies([]);
    } else {
      // Open replies and show reply form
      setShowReplies(true);
      setShowReplyForm(true);

      // Always fetch replies when opening (to ensure fresh data)
      if (replyCount > 0) {
        await loadReplies(0);
      }
    }
  };

  const loadReplies = async (page: number) => {
    setIsLoadingReplies(true);
    try {
      console.log('💬 Fetching replies for comment:', comment.id, 'page:', page);
      const fetchedReplies = await getCommentReplies(comment.id, page, 10);
      console.log('✅ Replies fetched successfully:', fetchedReplies);

      // Log each reply's parentId to debug
      fetchedReplies.forEach((reply, index) => {
        console.log(`Reply ${index} - id: ${reply.id}, parentId: ${reply.parentId}, replyCount: ${reply.replyCount}`);
      });

      // Check if there are more replies
      setHasMoreReplies(fetchedReplies.length === 10);

      if (page === 0) {
        setReplies(fetchedReplies);
      } else {
        setReplies(prev => [...prev, ...fetchedReplies]);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error('❌ Failed to fetch replies:', error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleLoadMoreReplies = () => {
    loadReplies(currentPage + 1);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      console.log('💬 Creating reply for comment:', comment.id, 'postId:', postId, 'parentId:', comment.id);
      const newReply = await createReply(postId, comment.id, replyContent.trim());
      console.log('✅ Reply created successfully:', newReply);

      // Add new reply to the list
      setReplies([newReply, ...replies]);

      // Update reply count
      setReplyCount(replyCount + 1);

      // Clear the form
      setReplyContent('');
      setShowReplyForm(true); // Keep form open for more replies
    } catch (error) {
      console.error('❌ Failed to create reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Function to refresh replies after a reply is deleted or added
  const handleRefreshReplies = async () => {
    console.log('🔄 Refreshing replies for comment:', comment.id);
    try {
      // Reload from the first page to get fresh data
      await loadReplies(0);

      // Also update reply count
      const updatedComment = await getCommentDetail(comment.id);
      setReplyCount(updatedComment.replyCount || 0);
    } catch (error) {
      console.error('❌ Failed to refresh replies:', error);
    }
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentAvatar}>
        {hasValidAvatar(comment.memberAvatarUrl) && convertImageUrl(comment.memberAvatarUrl) ? (
          <img
            src={convertImageUrl(comment.memberAvatarUrl)!}
            alt={comment.memberDisplayName || comment.memberName}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <span>{getAvatarInitial(comment.memberDisplayName, comment.memberName, comment.memberHandle)}</span>
        )}
      </div>
      <div className={styles.commentContent}>
        <div className={styles.commentHeader}>
          <div className={styles.commentHeaderLeft}>
            <span className={styles.commentAuthor}>
              {comment.memberDisplayName || comment.memberName || 'Unknown User'}
            </span>
            <span className={styles.commentHandle}>
              @{comment.memberHandle || 'unknown'}
            </span>
            <span className={styles.commentTime}>
              · {formatDate(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className={styles.editedTag}>(수정됨)</span>
            )}
          </div>
          {isOwner && !isEditing && (
            <div className={styles.commentHeaderRight}>
              <button
                onClick={() => setIsEditing(true)}
                className={styles.headerActionButton}
                title="수정"
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={styles.headerActionButton}
                title="삭제"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editTextarea}
              rows={3}
              autoFocus
              disabled={isSubmitting}
            />
            <div className={styles.editActions}>
              <button
                onClick={handleUpdate}
                disabled={!editContent.trim() || isSubmitting}
                className={styles.saveButton}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className={styles.cancelButton}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.commentText}>
              {comment.content.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>

            <div className={styles.commentStats}>
              <button
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                onClick={handleLikeToggle}
                disabled={isLikeLoading}
                title={isLiked ? '좋아요 취소' : '좋아요'}
              >
                <span className={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</span>
                <span className={styles.likeCount}>{likeCount.toLocaleString()}</span>
              </button>
              {/* Show reply button for all comments (including nested replies) */}
              <button
                className={styles.replyButton}
                onClick={handleToggleReplies}
                title={showReplies ? '답글 숨기기' : (replyCount > 0 ? '답글 보기' : '답글 달기')}
              >
                <span className={styles.replyIcon}>💬</span>
                <span className={styles.replyCount}>{replyCount.toLocaleString()}</span>
              </button>
            </div>

            {/* Reply form and replies section */}
            {showReplies && (
              <div className={styles.repliesSection}>
                {/* Reply input form */}
                {showReplyForm && user && (
                  <div className={styles.replyForm}>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 입력하세요..."
                      className={styles.replyTextarea}
                      rows={2}
                      disabled={isSubmittingReply}
                    />
                    <div className={styles.replyFormActions}>
                      <button
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim() || isSubmittingReply}
                        className={styles.replySubmitButton}
                      >
                        {isSubmittingReply ? '등록 중...' : '답글 등록'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isLoadingReplies && (
                  <div className={styles.repliesLoading}>
                    <div className={styles.repliesLoadingText}>답글을 불러오는 중...</div>
                  </div>
                )}

                {/* Replies list */}
                {replies.length > 0 && (
                  <div className={styles.repliesList}>
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onReplyDeleted={handleRefreshReplies}
                        isReply={true}
                      />
                    ))}
                  </div>
                )}

                {/* Load more replies button */}
                {!isLoadingReplies && hasMoreReplies && replies.length > 0 && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      onClick={handleLoadMoreReplies}
                      className={styles.loadMoreButton}
                    >
                      답글 더보기
                    </button>
                  </div>
                )}

                {/* Empty state (only show if not loading and no replies) */}
                {!isLoadingReplies && replies.length === 0 && !showReplyForm && (
                  <div className={styles.noReplies}>답글이 없습니다.</div>
                )}
              </div>
            )}
          </>
        )}

        {showDeleteConfirm && (
          <div className={styles.deleteConfirm}>
            <p>정말로 이 댓글을 삭제하시겠습니까?</p>
            <div className={styles.confirmActions}>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className={styles.deleteButton}
              >
                {isSubmitting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className={styles.cancelButton}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}