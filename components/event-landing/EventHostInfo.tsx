"use client";

import { ChevronRight, Instagram, Share2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicEventHost } from "@/types";

const EventHostInfo = ({
  host,
  shareTitle,
}: {
  host: PublicEventHost;
  shareTitle?: string;
}) => {
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const instagramUrl = host.instagram?.url;

  const handleShare = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: shareTitle ?? "",
          url: typeof window !== "undefined" ? window.location.href : "",
          text: shareTitle ?? "",
        })
        .catch(() => {});
    } else if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
    }
  }, [shareTitle]);

  return (
    <section className="flex flex-wrap items-center justify-between gap-4">
      {/* Left: Avatar (block 1) + Hosted by / Know more (block 2) */}
      <div className="flex items-center gap-x-4">
        <div className="bg-muted ring-background size-12 shrink-0 overflow-hidden rounded-full ring-2 md:size-14">
          {host.image ? (
            <img
              src={host.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground flex h-full w-full items-center justify-center text-lg font-medium">
              {host.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <p className="text-muted-foreground text-sm">Hosted by {host.name}</p>
          <button
            type="button"
            onClick={() => setHostModalOpen(true)}
            className="text-foreground mt-0.5 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Know more
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Right: Share button (icon + label) */}
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={handleShare}
      >
        <Share2 className="size-4" />
        Share
      </Button>

      <Dialog open={hostModalOpen} onOpenChange={setHostModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About {host.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {host.image && (
              <div className="flex justify-center">
                <img
                  src={host.image}
                  alt=""
                  className="aspect-square max-h-[50vh] w-full rounded-full object-cover"
                />
              </div>
            )}

            {host.bio && (
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {host.bio}
              </p>
            )}

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
              >
                <Instagram className="size-4" />
                Instagram
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EventHostInfo;
