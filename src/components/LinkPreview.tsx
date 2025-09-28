'use client';

import { useState, useEffect } from 'react';
import { LinkPreviewData, fetchLinkPreview } from '@/utils/linkPreview';
import styles from './LinkPreview.module.css';

interface LinkPreviewProps {
  url: string;
  previewData?: LinkPreviewData | null;
  onLoad?: (data: LinkPreviewData | null) => void;
  className?: string;
}

export default function LinkPreview({ url, previewData, onLoad, className }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(previewData || null);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (previewData) {
      setPreview(previewData);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchLinkPreview(url);

        if (isMounted) {
          setPreview(data);
          setLoading(false);
          if (onLoad) {
            onLoad(data);
          }
        }
      } catch (err) {
        console.error('Failed to load preview:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
          if (onLoad) {
            onLoad(null);
          }
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [url, previewData, onLoad]);

  if (loading) {
    return (
      <div className={`${styles.preview} ${styles.loading} ${className || ''}`}>
        <div className={styles.loadingText}>링크 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.preview} ${styles.fallback} ${className || ''}`}
      >
        <div className={styles.urlText}>🔗 {url}</div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.preview} ${className || ''}`}
    >
      {preview.image && (
        <div className={styles.imageContainer}>
          <img
            src={preview.image}
            alt={preview.title || 'Link preview'}
            className={styles.image}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className={styles.content}>
        {preview.title && (
          <div className={styles.title}>{preview.title}</div>
        )}
        {preview.description && (
          <div className={styles.description}>{preview.description}</div>
        )}
        <div className={styles.url}>
          {preview.siteName || new URL(url).hostname}
        </div>
      </div>
    </a>
  );
}