"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PENDING_PATH = "/admin/master/pending";

const MasterAdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(PENDING_PATH);
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting…</p>
    </div>
  );
};

export default MasterAdminPage;
