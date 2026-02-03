"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import ExperiencesTable from "@/components/host/ExperiencesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listEvents, toggleEventStatus } from "@/lib/experiences-client";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

const EXPERIENCES_QUERY_KEY = ["experiences"];

const HostExperiencesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: events = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: EXPERIENCES_QUERY_KEY,
    queryFn: () => {
      const tkn = useAuthStore.getState().token;
      if (!tkn) throw new Error("Not signed in");
      return listEvents(tkn);
    },
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({ id }: { id: string }) => toggleEventStatus(id, token!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCES_QUERY_KEY });
      toast.success(data.isActive ? "Event activated" : "Event deactivated");
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    },
  });

  const fuse = useMemo(() => {
    if (events.length === 0) return null;

    return new Fuse(events, {
      keys: ["title", "slug"],
      threshold: 0.4,
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    if (!fuse) return events;

    const results = fuse.search(searchQuery);
    return results.map((r) => r.item);
  }, [events, searchQuery, fuse]);

  const handleToggleStatus = (id: string) => {
    if (!token) return;
    mutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />

          <span>Loading events…</span>
        </div>
      </div>
    );
  }

  if (isError && error) {
    const is401 =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401;

    if (is401) {
      clearAuth();
      toast.error("Session expired. Please sign in again.");
      router.push("/host/login");
      return null;
    }

    return (
      <div className="p-6">
        <p className="text-destructive">
          Failed to load events. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Experiences</h1>

          <p className="text-muted-foreground mt-1">
            List and manage your events.
          </p>
        </div>

        <Button asChild>
          <Link href="/host/experiences/new?type=event">Create event</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />

        <Input
          placeholder="Search by title or slug…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:w-80"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          {events.length === 0
            ? "No events yet. Create your first event to get started."
            : "No events match your search."}
        </div>
      ) : (
        <ExperiencesTable
          events={filteredEvents}
          onToggleStatus={handleToggleStatus}
          isTogglingId={
            mutation.isPending && mutation.variables
              ? mutation.variables.id
              : null
          }
        />
      )}
    </div>
  );
};

export default HostExperiencesPage;
