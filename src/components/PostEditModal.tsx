'use client';

import { useState, useEffect } from 'react';
import styles from './PostEditModal.module.css';

interface PostEditModalProps {
  postId: number;
  initialContent: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: number, content: string) => Promise<void>;
}

export default function PostEditModal({
  postId,
  initialContent,
  isOpen,
  onClose,
  onSave,
}: PostEditModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setContent(initialContent);
    setError('');
  }, [initialContent, isOpen]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(postId, content.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || '수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>게시글 수정</h2>
          <button
            className={styles.closeButton}
            onClick={handleCancel}
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="무슨 일이 일어나고 있나요?"
            disabled={isSaving}
            autoFocus
          />
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isSaving}
          >
            취소
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}