import ProtectedRoute from '@/components/ProtectedRoute';

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}