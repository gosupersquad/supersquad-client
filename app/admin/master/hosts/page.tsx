"use client";

import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Loader2, Pencil, Search, User, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import CreateHostForm from "@/components/host/host-form/CreateHostForm";
import EditHostForm from "@/components/host/host-form/EditHostForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/constants";
import { isMasterForbidden } from "@/lib/master-admin/experiences-client";
import { listHosts, type HostListItem } from "@/lib/master-admin/hosts-client";
import { useAuthStore } from "@/store/auth-store";

const HOSTS_QUERY_KEY = ["master", "hosts"];

interface HostCardProps {
  host: HostListItem;
  onEdit: (id: string) => void;
}

const HostCard = ({ host, onEdit }: HostCardProps) => {
  const instagramUrl = host.instagram?.url;

  return (
    <article className="bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm">
      <div className="flex items-center gap-4 p-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {host.image ? (
            <Image
              src={host.image}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="text-muted-foreground size-7" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{host.name}</h3>

          <p className="text-muted-foreground truncate text-sm">
            @{host.username}
          </p>

          {host.bio && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {host.bio}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                host.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {host.isActive ? "Active" : "Inactive"}
            </span>

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(host._id)}
          aria-label="Edit host"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    </article>
  );
};

export default function MasterHostsPage() {
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const [createOpen, setCreateOpen] = useState(false);
  const [editHostId, setEditHostId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: hosts = [],
    isLoading,
    error: listError,
  } = useQuery({
    queryKey: HOSTS_QUERY_KEY,
    queryFn: () => listHosts(token!),
    enabled: !!token && role === ROLES.MASTER,
  });

  const filteredHosts = useMemo(() => {
    if (!searchQuery.trim()) return hosts;

    const fuse = new Fuse(hosts, {
      keys: ["name", "username"],
      threshold: 0.3,
    });

    return fuse.search(searchQuery.trim()).map((r) => r.item);
  }, [hosts, searchQuery]);

  const hasHandled403 = useRef(false);
  useEffect(() => {
    if (listError && isMasterForbidden(listError) && !hasHandled403.current) {
      hasHandled403.current = true;
      router.replace("/host/dashboard");
      toast.error("Access denied");
    }
  }, [listError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading hosts…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hosts</h1>
          <p className="text-muted-foreground mt-1">Manage hosts.</p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-2 size-4" />
          Add host
        </Button>
      </div>

      {hosts.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          No hosts yet. Add your first host to get started.
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by name or username…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search hosts"
            />
          </div>

          {filteredHosts.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              No hosts match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredHosts.map((host) => (
                <HostCard key={host._id} host={host} onEdit={setEditHostId} />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
        }}
      >
        <DialogContent showCloseButton className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add host</DialogTitle>
          </DialogHeader>

          <CreateHostForm
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editHostId}
        onOpenChange={(open) => {
          if (!open) setEditHostId(null);
        }}
      >
        <DialogContent showCloseButton className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit host</DialogTitle>
          </DialogHeader>

          {editHostId && (
            <EditHostForm
              hostId={editHostId}
              onSuccess={() => setEditHostId(null)}
              onCancel={() => setEditHostId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
