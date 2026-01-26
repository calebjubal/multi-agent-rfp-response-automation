"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  useEffect(() => {
    const url = token ? `/forgot-password?token=${encodeURIComponent(token)}` : "/forgot-password";
    router.replace(url);
  }, [router, token]);

  return null;
}
