"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Check, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { getFirstImageUrl } from "@/components/checkout/CheckoutHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/constants";
import {
  isMasterForbidden,
  listPendingExperiences,
  setApproval,
  type MasterEventListItem,
} from "@/lib/master-admin/experiences-client";
import { useAuthStore } from "@/store/auth-store";

interface PendingCardProps {
  item: MasterEventListItem;
  token: string;
}

const PendingCard = ({ item, token }: PendingCardProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleMasterError = (e: Error) => {
    if (isMasterForbidden(e)) {
      router.replace("/host/dashboard");
      toast.error("Access denied");
    } else {
      toast.error(e.message || "Something went wrong");
    }
  };

  const approve = useMutation({
    mutationFn: () => setApproval(item.id, { approved: true }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["master", "pending-count"] });
      toast.success("Approved");
    },
    onError: handleMasterError,
  });

  const reject = useMutation({
    mutationFn: (rejectedReason?: string) =>
      setApproval(item.id, { approved: false, rejectedReason }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["master", "pending-count"] });
      toast.success("Rejected");
    },
    onError: handleMasterError,
  });

  const handleReject = () => {
    const confirmed = window.confirm(
      "Reject this event? The host will see your reason (you can add it in the next step).",
    );

    if (!confirmed) return;

    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return; // user cancelled prompt

    reject.mutate(reason.trim() || undefined);
  };

  const imageUrl = getFirstImageUrl(item.media);
  const previewHref = `/admin/master/experiences/${item.id}/preview`;

  return (
    <article className="bg-card flex max-w-sm flex-col overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-muted relative aspect-video">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 400px"
          />
        ) : (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="truncate font-medium">{item.title}</h3>

          <p className="text-muted-foreground truncate text-sm">
            {item.host?.name || item.host?.username || "—"}
          </p>
        </div>

        <Link
          href={previewHref}
          className="w-full"
          // target="_blank"
          // rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="w-full">
            Preview
          </Button>
        </Link>

        <div className="mt-auto flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleReject}
            disabled={approve.isPending || reject.isPending}
          >
            <X className="mr-1 h-4 w-4" />
            Reject
          </Button>

          <Button
            size="sm"
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => approve.mutate()}
            disabled={approve.isPending || reject.isPending}
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </article>
  );
};

const MasterPendingPage = () => {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: list = [],
    isLoading,
    error: listError,
  } = useQuery({
    queryKey: ["master", "pending"],
    queryFn: () => listPendingExperiences(token!, "pending"),
    enabled: !!token && role === ROLES.MASTER,
  });

  const hasHandled403 = useRef(false);
  useEffect(() => {
    if (listError && isMasterForbidden(listError) && !hasHandled403.current) {
      hasHandled403.current = true;
      router.replace("/host/dashboard");
      toast.error("Access denied");
    }
  }, [listError, router]);

  const fuse = useMemo(() => {
    if (list.length === 0) return null;

    return new Fuse(list, {
      keys: ["title", "slug", "host.name", "host.username"],
      threshold: 0.4,
    });
  }, [list]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list;
    if (!fuse) return list;

    const results = fuse.search(searchQuery);
    return results.map((r) => r.item);
  }, [list, searchQuery, fuse]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Pending approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject events before they go live.
        </p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by title, slug or host…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:w-80"
        />
      </div>

      {filteredList.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          {list.length === 0
            ? "No pending approvals."
            : "No events match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((item) => (
            <PendingCard key={item.id} item={item} token={token!} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MasterPendingPage;
