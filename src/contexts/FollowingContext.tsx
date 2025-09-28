'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FollowingContextType {
  refreshFollowing: () => void;
  followingRefreshKey: number;
}

const FollowingContext = createContext<FollowingContextType | undefined>(undefined);

export function FollowingProvider({ children }: { children: ReactNode }) {
  const [followingRefreshKey, setFollowingRefreshKey] = useState(0);

  const refreshFollowing = () => {
    setFollowingRefreshKey(prev => prev + 1);
  };

  return (
    <FollowingContext.Provider value={{ refreshFollowing, followingRefreshKey }}>
      {children}
    </FollowingContext.Provider>
  );
}

export function useFollowing() {
  const context = useContext(FollowingContext);
  if (context === undefined) {
    throw new Error('useFollowing must be used within a FollowingProvider');
  }
  return context;
}