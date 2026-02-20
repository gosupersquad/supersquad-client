"use client";

import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Calendar, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";

import { ApprovalStatus } from "@/components/custom/ApprovalBadge";
import EventCard from "@/components/host/EventCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROLES } from "@/lib/constants";
import {
  isMasterForbidden,
  listAllExperiences,
  type MasterEventListItem,
} from "@/lib/master-admin/experiences-client";
import {
  formatEventDates,
  getEventDuration,
  toEventCardData,
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const EXPERIENCES_QUERY_KEY = ["master", "experiences", "all"];

function SpotsCell({ item }: { item: MasterEventListItem }) {
  const total = item.totalSpots ?? 0;
  const left = item.spotsAvailable ?? 0;

  if (total === 0) return <span>–</span>;
  if (left === 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        Sold out
      </span>
    );
  }

  return (
    <span>
      {left} / {total}
    </span>
  );
}

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
              {/* Desktop: table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Host</TableHead>

                      <TableHead>Spots left</TableHead>
                      <TableHead>Dates</TableHead>

                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredEvents.map((event) => {
                      const duration = getEventDuration(
                        String(event.startDate),
                        String(event.endDate),
                      );

                      const { datesText } = formatEventDates(
                        String(event.startDate),
                        String(event.endDate),
                      );

                      const viewLiveHref = `/hosts/${event.host.username}/events/${event.slug}`;

                      return (
                        <TableRow key={event.id}>
                          <TableCell
                            className="max-w-[200px] truncate font-medium"
                            title={event.title}
                          >
                            {event.title}
                          </TableCell>

                          <TableCell>
                            <span className="font-medium">
                              {event.host.name}
                            </span>

                            <span className="text-muted-foreground ml-2 text-xs">
                              (@{event.host.username})
                            </span>
                          </TableCell>

                          <TableCell>
                            <SpotsCell item={event} />
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="text-muted-foreground size-4" />
                              <span>{datesText}</span>
                            </div>
                          </TableCell>

                          <TableCell>{duration ?? "–"}</TableCell>

                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" asChild>
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: cards */}
              <div className="md:hidden">
                <div className="grid gap-4 sm:grid-cols-1">
                  {filteredEvents.map((event) => {
                    const viewLiveHref = `/hosts/${event.host.username}/events/${event.slug}`;

                    const cardData = toEventCardData({
                      ...event,
                      location: "",
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
