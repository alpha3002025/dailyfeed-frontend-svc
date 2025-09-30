'use client';

import { Post } from '@/lib/auth';
import { extractUrls } from '@/utils/linkPreview';
import LinkPreview from './LinkPreview';
import { hasValidAvatar, getAvatarInitial } from '@/utils/avatarUtils';
import { useRouter } from 'next/navigation';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  isLiking?: boolean;
  showEditButton?: boolean;
  className?: string;
}

export default function PostCard({ post, onLike, onComment, onEdit, isLiking, showEditButton = false, className }: PostCardProps) {
  const router = useRouter();
  const urls = extractUrls(post.content);
  const firstUrl = urls.length > 0 ? urls[0] : null;

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('a')) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`${styles.postCard} ${className || ''}`}
      onClick={handlePostClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.postHeader}>
        <div className={styles.authorAvatar}>
          {hasValidAvatar(post.memberAvatarUrl) ? (
            <img src={post.memberAvatarUrl} alt="Profile" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>{getAvatarInitial(post.memberDisplayName, post.memberName, post.memberHandle)}</span>
            </div>
          )}
        </div>
        <div className={styles.authorInfo}>
          <div className={styles.authorName}>
            {post.memberDisplayName || post.memberName || post.authorName || 'Unknown'}
          </div>
          <div className={styles.authorHandle}>
            @{post.memberHandle || post.authorHandle || 'unknown'}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.postTime}>
            {formatDate(post.createdAt)}
          </div>
          {showEditButton && onEdit && (
            <button
              className={styles.editButton}
              onClick={() => onEdit(post.id)}
              title="게시글 수정"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.postContent}>
        {post.content}
      </div>

      {firstUrl && !post.linkPreview && (
        <LinkPreview url={firstUrl} />
      )}

      {post.linkPreview && (
        <LinkPreview url={post.linkPreview.url} previewData={post.linkPreview} />
      )}

      <div className={styles.postActions}>
        <button
          className={`${styles.actionButton} ${post.isLiked ? styles.liked : ''}`}
          onClick={() => onLike && onLike(post.id)}
          disabled={isLiking}
        >
          <svg className={styles.actionIcon} viewBox="0 0 24 24" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likesCount || 0}</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => onComment && onComment(post.id)}
        >
          <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.commentsCount || 0}</span>
        </button>

        <button className={styles.actionButton}>
          <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{post.sharesCount || 0}</span>
        </button>
      </div>
    </div>
  );
}