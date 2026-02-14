"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import EventCard from "@/components/host/EventCard";
import { listLeads } from "@/lib/leads-client";
import { toEventCardData } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const LEADS_QUERY_KEY = ["leads"];

const HostLeadsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = (searchParams.get("type") as "event" | "trip") || "event";

  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const {
    data: events = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [...LEADS_QUERY_KEY, type],
    queryFn: () => listLeads(token!, type),
    enabled: !!token,
  });

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

  if (isError && error) {
    const res = (error as { response?: { status?: number } }).response;

    if (res?.status === 401) {
      clearAuth();
      toast.error("Session expired. Please sign in again.");
      router.push("/host/login");
      return null;
    }

    return (
      <div className="p-6">
        <p className="text-destructive">
          Failed to load leads. Please try again.
        </p>
      </div>
    );
  }

  if (type !== "event") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Leads</h1>

        <p className="text-muted-foreground mt-1">
          Trips are not supported yet.
        </p>

        <p className="text-muted-foreground mt-4">
          Use ?type=event to see events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>

        <p className="text-muted-foreground mt-1">
          Events and bookings. Click an event to see spots booked, amount
          collected, and guest details.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          No events yet. Create an event from Experiences to see leads here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={toEventCardData(event)}
              linkHref={`/host/leads/event/${event.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HostLeadsPage;
