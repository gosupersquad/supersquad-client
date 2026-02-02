"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
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

      <div className="mt-6">
        <Button variant="outline" className="gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default HostAccountPage;
