'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser, LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();

        if (token) {
          const storedEmail = localStorage.getItem('user_email') || 'user@example.com';
          const storedHandle = localStorage.getItem('user_handle') || storedEmail.split('@')[0];
          const storedMemberId = localStorage.getItem('user_member_id');
          const storedAvatarUrl = localStorage.getItem('user_avatar_url');

          const tempUser: AuthUser = {
            id: storedMemberId || 'temp-id',
            email: storedEmail,
            memberName: storedHandle,
            handle: storedHandle,
            displayName: storedHandle,
            memberId: storedMemberId ? parseInt(storedMemberId) : undefined,
            avatarUrl: storedAvatarUrl || undefined,
          };
          setUser(tempUser);
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_handle', userData.handle);
      if (userData.memberId) {
        localStorage.setItem('user_member_id', userData.memberId.toString());
      }
      if (userData.avatarUrl) {
        localStorage.setItem('user_avatar_url', userData.avatarUrl);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      // Clear stored user info
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_handle');
      localStorage.removeItem('user_member_id');
      localStorage.removeItem('user_avatar_url');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the user locally
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_handle');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const updateUser = async (userData: AuthUser) => {
    setUser(userData);
    // Update stored user info if needed
    if (userData.email) {
      localStorage.setItem('user_email', userData.email);
    }
    if (userData.handle) {
      localStorage.setItem('user_handle', userData.handle);
    }
    if (userData.memberId) {
      localStorage.setItem('user_member_id', userData.memberId.toString());
    }
    if (userData.avatarUrl) {
      localStorage.setItem('user_avatar_url', userData.avatarUrl);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected pages
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}