'use client';

import "./global.css";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/feed');
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render if already authenticated
  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}