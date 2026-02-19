"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  LayoutGrid,
  LogOut,
  LucideIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ButtonWithBadge from "@/components/custom/ButtonWithBadge";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";
import { getPendingCount } from "@/lib/master-experiences-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_PATH = "/host/login";
const SIDEBAR_TITLE = "Master Admin";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeCount?: number;
};

const MasterLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [mounted, setMounted] = useState(false);

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["master", "pending-count"],
    queryFn: () => getPendingCount(token!),
    enabled: !!token && role === ROLES.MASTER,
  });

  const navItems: NavItem[] = [
    {
      label: "Experiences",
      href: "/admin/master/experiences",
      icon: LayoutGrid,
    },
    { label: "Hosts", href: "/admin/master/hosts", icon: Users },
    {
      label: "Approvals",
      href: "/admin/master/pending",
      icon: ClipboardList,
      badgeCount: pendingCount,
    },
  ];

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      toast("Please sign in to continue", { icon: "🔐" });
      router.replace(LOGIN_PATH);
      return;
    }

    if (role !== ROLES.MASTER) {
      router.replace("/host/dashboard");
      return;
    }
  }, [mounted, token, role, router]);

  const handleLogout = () => {
    clearAuth();
    router.replace(LOGIN_PATH);
  };

  if (!mounted || !token || role !== ROLES.MASTER) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar: fixed left, hidden on mobile — same as HostShell */}
      <aside className="border-border bg-background fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r md:flex">
        <div className="border-border flex h-14 items-center justify-between border-b px-4">
          <span className="text-foreground font-semibold">{SIDEBAR_TITLE}</span>
          <ThemeToggle variant="ghost" size="icon-sm" />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ label, href, icon: Icon, badgeCount }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-muted font-medium",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                      {badgeCount}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="border-border border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content: full width on mobile (pb for bottom bar), offset by sidebar on desktop */}
      <main className="flex-1 pb-16 md:ml-72 md:pb-0">{children}</main>

      {/* Mobile bottom bar — same structure as HostShell */}
      <nav
        className="border-border bg-background fixed inset-x-0 bottom-0 z-40 flex border-t md:hidden"
        aria-label="Master navigation"
      >
        <div className="bg-border grid w-full grid-cols-3 gap-px">
          {navItems.map(({ label, href, icon: Icon, badgeCount }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            const iconClass = cn(
              "transition-colors",
              isActive
                ? "fill-primary text-primary stroke-[2.5]"
                : "text-muted-foreground",
            );

            return (
              <Button
                key={href}
                variant="ghost"
                className={cn(
                  "h-16 w-full rounded-none",
                  isActive && "bg-muted font-medium",
                )}
                asChild
              >
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center"
                >
                  <ButtonWithBadge
                    icon={Icon}
                    label={label}
                    count={badgeCount}
                    iconClassName={iconClass}
                  />
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MasterLayout;
