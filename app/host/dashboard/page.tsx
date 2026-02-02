"use client";

import Link from "next/link";
import { LayoutGrid, Map, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const HostDashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  const quickLinks = [
    { label: "Experiences", href: "/host/experiences", icon: Map },
    {
      label: "More (Leads, Coupons, etc.)",
      href: "/host/more",
      icon: LayoutGrid,
    },
    { label: "Account", href: "/host/account", icon: User },
  ] as const;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>

      <p className="text-muted-foreground mt-1">
        Quick links to get started. If you’d rather land on Experiences, we can
        redirect the dashboard here later.
      </p>

      <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {quickLinks.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 py-4 sm:w-64"
              asChild
            >
              <Link href={href}>
                <Icon className="size-5 shrink-0 text-muted-foreground" />
                <span>{label}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HostDashboardPage;
