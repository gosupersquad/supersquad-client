"use client";

import { FileText, LogOut, Map } from "lucide-react";
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

// Phase 1: Experiences only; add Bookings, Coupons when in scope
const NAV_ITEMS: NavItem[] = [
  { label: "Experiences", href: "/host/experiences", icon: Map },
  { label: "Leads", href: "/host/leads", icon: FileText },
] as const;

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
      {/* Desktop sidebar: fixed left, hidden on mobile (Task 3 adds bottom bar) */}
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

      {/* Main content: full width on mobile, offset by sidebar on desktop */}
      <main className="flex-1 md:ml-72">{children}</main>
    </div>
  );
};

export default HostShell;
