"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import EventCard from "@/components/host/EventCard";
import MasterExperiencesTable from "@/components/master/MasterExperiencesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APPROVAL_STATUSES, ApprovalStatus, ROLES } from "@/lib/constants";
import {
  isMasterForbidden,
  listAllExperiences,
  setApproval,
  type MasterEventListItem,
} from "@/lib/master-admin/experiences-client";
import { toEventCardData } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const EXPERIENCES_QUERY_KEY = ["master", "experiences", "all"];

export default function MasterExperiencesPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: events = [],
    isLoading,
    error: listError,
  } = useQuery({
    queryKey: EXPERIENCES_QUERY_KEY,
    queryFn: () => listAllExperiences(token!),
    enabled: !!token && role === ROLES.MASTER,
  });

  const queryClient = useQueryClient();

  const setApprovalMutation = useMutation({
    mutationFn: ({
      id,
      approvalStatus,
      rejectedReason,
    }: {
      id: string;
      approvalStatus: ApprovalStatus;
      rejectedReason?: string;
    }) => setApproval(id, { approvalStatus, rejectedReason }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["master", "pending-count"] });
      queryClient.invalidateQueries({ queryKey: EXPERIENCES_QUERY_KEY });
      toast.success("Status updated");
    },
    onError: (e: Error) => {
      if (isMasterForbidden(e)) {
        router.replace("/host/dashboard");
        toast.error("Access denied");
      } else {
        toast.error(e.message || "Failed to update status");
      }
    },
  });

  const handleApprovalChange = (
    event: MasterEventListItem,
    value: ApprovalStatus,
  ) => {
    const current = event.approvalStatus ?? APPROVAL_STATUSES.PENDING;
    if (value === current) return;

    if (value === APPROVAL_STATUSES.REJECTED) {
      const confirmed = window.confirm(
        "Reject this event? The host will see your reason (you can add it in the next step).",
      );
      if (!confirmed) return;

      const reason = window.prompt("Reason for rejection (optional):", "");
      if (reason === null) return;

      setApprovalMutation.mutate({
        id: event.id,
        approvalStatus: APPROVAL_STATUSES.REJECTED,
        rejectedReason: reason.trim() || undefined,
      });
    } else if (value === APPROVAL_STATUSES.APPROVED) {
      const confirmed = window.confirm(
        "Mark this event as approved? It can go live if the host has published it.",
      );

      if (!confirmed) return;
      setApprovalMutation.mutate({ id: event.id, approvalStatus: value });
    } else {
      const confirmed = window.confirm(
        "Set this event back to pending? It will need approval again before going live.",
      );

      if (!confirmed) return;
      setApprovalMutation.mutate({ id: event.id, approvalStatus: value });
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const fuse = new Fuse(events, {
      keys: ["title", "slug", "host.name", "host.username"],
      threshold: 0.3,
    });

    return fuse.search(searchQuery.trim()).map((r) => r.item);
  }, [events, searchQuery]);

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
        <p className="text-muted-foreground text-sm">Loading experiences…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">All experiences</h1>
        <p className="text-muted-foreground mt-1">
          All events from all hosts. View live page to see the public listing.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          No experiences yet.
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />

            <Input
              type="search"
              placeholder="Search by title, slug or host…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search experiences"
            />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              No experiences match your search.
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <MasterExperiencesTable
                  events={filteredEvents}
                  onApprovalChange={handleApprovalChange}
                  isUpdatingId={
                    setApprovalMutation.isPending &&
                    setApprovalMutation.variables
                      ? setApprovalMutation.variables.id
                      : null
                  }
                />
              </div>

              {/* Mobile: cards */}
              <div className="md:hidden">
                <div className="grid gap-4 sm:grid-cols-1">
                  {filteredEvents.map((event) => {
                    const viewLiveHref = `/hosts/${event.host.username}/events/${event.slug}`;

                    const cardData = toEventCardData({
                      ...event,
                      location: event.location ?? "",
                    });

                    const actions = (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 border-0 bg-black/70 text-white shadow-sm hover:bg-black/80"
                            asChild
                          >
                            <Link
                              href={viewLiveHref}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          <p>View live page</p>
                        </TooltipContent>
                      </Tooltip>
                    );

                    return (
                      <EventCard
                        key={event.id}
                        event={cardData}
                        actions={actions}
                        hostName={event.host.name}
                        approvalStatus={event.approvalStatus as ApprovalStatus}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
