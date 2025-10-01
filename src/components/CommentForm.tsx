'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasValidAvatar, getAvatarInitial } from '@/utils/avatarUtils';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  onSubmit,
  placeholder = '댓글을 작성하세요...',
  buttonText = '댓글 작성',
  initialValue = '',
  autoFocus = false
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputContainer}>
        <div className={styles.avatar}>
          {hasValidAvatar(user.avatarUrl) ? (
            <img src={user.avatarUrl || ''} alt={user.displayName || user.memberName} />
          ) : (
            <span>{getAvatarInitial(user.displayName, user.memberName, user.handle)}</span>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={styles.textarea}
            rows={3}
            autoFocus={autoFocus}
            disabled={isSubmitting}
          />
          <div className={styles.actions}>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? '처리중...' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}