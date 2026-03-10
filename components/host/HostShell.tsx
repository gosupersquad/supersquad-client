"use client";

import { FileText, LogOut, Map, Percent, Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const SIDEBAR_TITLE = "Supersquad Admin";

type NavItem = {
  /** If present, rendered below icon in mobile bar; omit for icon-only. */
  label?: string;
  href: string;
  icon?: React.ElementType;
  /** When true, show host avatar instead of icon (mobile bar only). */
  useAvatar?: boolean;
};

// Desktop sidebar nav (Phase 1: Experiences, Discount codes, Leads)
const NAV_ITEMS: (NavItem & { icon: React.ElementType })[] = [
  { label: "Experiences", href: "/host/experiences", icon: Map },
  { label: "Discount codes", href: "/host/discount-codes", icon: Percent },
  { label: "Leads", href: "/host/leads", icon: FileText },
];

// Mobile bottom bar: Experiences, Create (Plus), Profile (avatar). Set label to show text.
const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/host/experiences", icon: Map },
  { href: "/host/experiences/new?type=event", icon: Plus },
  { href: "/host/account", useAvatar: true },
];

const HostShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    clearAuth();
    router.replace("/host/login");
  };

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar: fixed left, hidden on mobile */}
      <aside className="border-border bg-background fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r md:flex">
        <div className="border-border flex h-14 items-center justify-between border-b px-4">
          <span className="text-foreground font-semibold">{SIDEBAR_TITLE}</span>

          <ThemeToggle variant="ghost" size="icon-sm" />
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

      {/* Mobile bottom bar: Experiences, Create, Profile (avatar) */}
      <nav
        className="border-border bg-background fixed inset-x-0 bottom-0 z-40 flex border-t md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="bg-border grid w-full grid-cols-3 gap-px">
          {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon, useAvatar }) => {
            const baseHref = href.split("?")[0];
            let isActive =
              pathname === baseHref || pathname.startsWith(baseHref + "/");
            // On create page, only "Create" is active — not "Experiences"
            if (
              baseHref === "/host/experiences" &&
              pathname.startsWith("/host/experiences/new")
            ) {
              isActive = false;
            }

            const iconClass = cn(
              "size-7 transition-colors shrink-0",
              isActive && !useAvatar
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
                  {useAvatar ? (
                    user?.image ? (
                      <span className="bg-muted relative size-9 overflow-hidden rounded-full">
                        <Image
                          src={user.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      </span>
                    ) : (
                      <User className={cn("size-7", iconClass)} aria-hidden />
                    )
                  ) : (
                    Icon && <Icon className={iconClass} aria-hidden />
                  )}

                  {label != null && label !== "" && (
                    <span className="text-xs">{label}</span>
                  )}
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
