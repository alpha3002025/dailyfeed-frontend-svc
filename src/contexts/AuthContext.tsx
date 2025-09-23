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
    // Check if user is already logged in on app start
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Set authenticated state based on token presence
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
      console.log('🔑 AuthContext: Starting login process');
      setIsLoading(true);
      const { user: userData } = await authService.login(credentials);
      console.log('👤 AuthContext: Login successful, setting user:', userData);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ AuthContext: Auth state updated - isAuthenticated: true');
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthContext: Login process finished, isLoading: false');
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the user locally
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    login,
    logout,
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