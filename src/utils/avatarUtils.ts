/**
 * Convert backend image URL to frontend-accessible URL
 * - http://dailyfeed.local:8889/* URLs: Use as-is (directly accessible)
 * - http://dailyfeed-*-svc:* URLs: Convert to /api/proxy/images/view/xxx
 * - Other external URLs: Use as-is
 */
export function convertImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If already a proxy URL, return as-is
  if (url.startsWith('/api/proxy/')) {
    return url;
  }

  // If it's http://dailyfeed.local:8889, return as-is (directly accessible)
  if (url.startsWith('http://dailyfeed.local:8889')) {
    return url;
  }

  // Check if it's an internal service URL (dailyfeed-*-svc)
  // Pattern: http://dailyfeed-image-svc:8080/api/images/view/xxx
  if (url.includes('dailyfeed-') && url.includes('-svc')) {
    const match = url.match(/\/api\/images\/view\/(.+)/);
    if (match) {
      return `/api/proxy/images/view/${match[1]}`;
    }
  }

  // If it's a relative path starting with /api/images/, convert to proxy
  if (url.startsWith('/api/images/')) {
    return url.replace('/api/images/', '/api/proxy/images/');
  }

  // External URL (starts with http:// or https:// but not internal service)
  // Return as-is for external images
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path, return as-is
  if (url.startsWith('/')) {
    return url;
  }

  // Default: return the URL as-is
  return url;
}

export function hasValidAvatar(avatarUrl: string | null | undefined): boolean {
  return !!(avatarUrl && avatarUrl !== 'no-image' && avatarUrl.trim() !== '');
}

export function getAvatarInitial(displayName?: string, memberName?: string, handle?: string): string {
  const name = displayName || memberName || handle;
  return name?.charAt(0).toUpperCase() || 'U';
}