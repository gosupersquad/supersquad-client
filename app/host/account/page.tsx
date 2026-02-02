"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthStore } from "@/store/auth-store";

const HostAccountPage = () => {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace("/host/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Account</h1>

      <p className="text-muted-foreground mt-1">
        Manage your host profile. Edit profile coming later.
      </p>

      {user && (
        <p className="mt-3 text-sm text-muted-foreground">
          {user.name} · {user.email}
        </p>
      )}

      {/* Theme toggle tile (mobile-friendly; desktop has toggle in sidebar) */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm font-medium">Appearance</span>

          <ThemeToggle variant="outline" size="icon-sm" />
        </div>

        <Button variant="outline" className="gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default HostAccountPage;
