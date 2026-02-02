"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_PATH = "/host/login";
const DASHBOARD_PATH = "/host/dashboard";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const [mounted, setMounted] = useState(false);

  console.log("rendered auth layout -- protection guard");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isLoginPage = pathname === LOGIN_PATH;
    const isAuthenticated = Boolean(token);

    // 🚫 Unauthenticated user on protected route
    if (!isAuthenticated && !isLoginPage) {
      router.replace(LOGIN_PATH);
      return;
    }

    // 🚫 Authenticated user on login page
    if (isAuthenticated && isLoginPage) {
      router.replace(DASHBOARD_PATH);
    }
  }, [mounted, pathname, token, router]);

  // Login page: no shell, render as-is
  if (pathname === LOGIN_PATH) {
    return <>{children}</>;
  }

  // Protected: wait for mount + auth check before showing content (avoids flash then redirect)
  if (!mounted || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
