"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import EventLandingPage from "@/components/event-landing/EventLandingPage";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";
import { getExperienceForPreview } from "@/lib/master-experiences-client";
import { useAuthStore } from "@/store/auth-store";
import { useParams } from "next/navigation";

const MasterExperiencePreviewPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["master", "preview", eventId],
    queryFn: () => getExperienceForPreview(eventId!, token!),
    enabled: !!token && role === ROLES.MASTER && !!eventId,
  });

  if (!eventId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid preview.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading preview…</span>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/master/pending">
            <ArrowLeft className="mr-2 size-4" />
            Back to Pending
          </Link>
        </Button>

        <p className="text-destructive">
          Failed to load event. It may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="border-border bg-background/95 sticky top-0 z-20 flex items-center gap-4 border-b px-4 py-3 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/master/pending">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>

        <span className="text-muted-foreground text-sm">
          Preview mode — booking disabled
        </span>
      </div>

      <EventLandingPage event={event} preview />
    </div>
  );
};

export default MasterExperiencePreviewPage;
