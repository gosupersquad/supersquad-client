"use client";

import { FileText, LayoutGrid, LogOut, Map, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const SIDEBAR_TITLE = "Supersquad Admin";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

// Desktop sidebar nav (Phase 1: Experiences, Leads; add Bookings, Coupons when in scope)
const NAV_ITEMS: NavItem[] = [
  { label: "Experiences", href: "/host/experiences", icon: Map },
  { label: "Leads", href: "/host/leads", icon: FileText },
];

// Mobile bottom bar: Experiences, More (Leads/Coupons etc), Account
const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Experiences", href: "/host/experiences", icon: Map },
  { label: "More", href: "/host/more", icon: LayoutGrid },
  { label: "Account", href: "/host/account", icon: User },
];

const HostShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    router.replace("/host/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar: fixed left, hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-semibold text-foreground">{SIDEBAR_TITLE}</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            // Active: exact or nested route (Task 5 may refine style to pill/border)
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
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
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

      {/* Mobile bottom bar: Experiences, Account (logout on Account page; future: edit host) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid w-full grid-cols-3 gap-px bg-border">
          {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            // Active tab: filled/heavier look (primary color + fill where icon supports it)
            const iconClass = cn(
              "size-5 transition-colors",
              isActive
                ? "fill-primary text-primary stroke-[2.5]"
                : "text-muted-foreground",
            );

            return (
              <Button
                key={href}
                variant="ghost"
                className={cn(
                  "h-16 w-full flex-col gap-1 rounded-none",
                  isActive && "bg-muted font-medium",
                )}
                asChild
              >
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center gap-1"
                >
                  <Icon className={iconClass} aria-hidden />
                  <span className="text-xs">{label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default HostShell;
