"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireRole({ children, requiredRole, redirectTo = "/" }) {
  const router = useRouter();
  const { user, isAuthenticated, loading, USER_ROLES } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user?.role !== USER_ROLES.ADMIN && user?.role !== requiredRole) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, loading, redirectTo, requiredRole, router, user?.role, USER_ROLES.ADMIN]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== USER_ROLES.ADMIN && user?.role !== requiredRole) return null;

  return children;
}
