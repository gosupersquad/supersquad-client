"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import HostShell from "@/components/host/HostShell";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_PATH = "/host/login";
const DASHBOARD_PATH = "/host/dashboard";

const HostLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark client-mounted so we can safely read persisted auth (avoids redirect before rehydration)
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isLoginPage = pathname === LOGIN_PATH;
    const isAuthenticated = Boolean(token);

    // 🚫 Unauthenticated user on protected route → toast + redirect
    if (!isAuthenticated && !isLoginPage) {
      toast("Please sign in to continue", { icon: "🔐" });
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

  // Protected routes: wrap in shell (sidebar on desktop, bottom bar on mobile in Task 3)
  return <HostShell>{children}</HostShell>;
};

export default HostLayout;
