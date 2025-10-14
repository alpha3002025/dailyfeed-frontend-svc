'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasValidAvatar, getAvatarInitial, convertImageUrl } from '@/utils/avatarUtils';
import type { Comment } from '@/lib/auth';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export default function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

            {isOwner && (
              <div className={styles.commentActions}>
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.actionButton}
                >
                  수정
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={styles.actionButton}
                >
                  삭제
                </button>
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