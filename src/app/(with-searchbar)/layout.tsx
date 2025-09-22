import { ReactNode, Suspense } from "react";
import Searchbar from "@/components/searchbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div>
        <Suspense fallback={<div>Loading ... </div>}>
          <Searchbar />
        </Suspense>
        {children}
      </div>
    </ProtectedRoute>
  );
}
