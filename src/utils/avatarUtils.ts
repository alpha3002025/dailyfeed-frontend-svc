export function hasValidAvatar(avatarUrl: string | null | undefined): boolean {
  return !!(avatarUrl && avatarUrl !== 'no-image' && avatarUrl.trim() !== '');
}

export function getAvatarInitial(displayName?: string, memberName?: string, handle?: string): string {
  const name = displayName || memberName || handle;
  return name?.charAt(0).toUpperCase() || 'U';
}