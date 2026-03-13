"use client";

import { Instagram, Send } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicEventHost } from "@/types";

const getShareUrl = () => {
  if (typeof window === "undefined") return "";

  // remove '/checkout' or '/checkout/' from the pathname
  const cleanPathname = window.location.href.replace(/checkout\/?$/, "");
  return cleanPathname;
};

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
          url: getShareUrl(),
          text: shareTitle ?? "",
        })
        .catch(() => {});
    } else if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(getShareUrl());
    }
  }, [shareTitle]);

  return (
    <section className="mt-6 space-y-2">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        Hosted by
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: host logo (opens host dialog on click) */}
        <button
          type="button"
          onClick={() => setHostModalOpen(true)}
          className="flex items-center gap-x-4"
          aria-label={`About ${host.name}`}
        >
          <div className="bg-muted ring-background relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-2">
            {host.image ? (
              <Image
                src={host.image}
                alt={host.name}
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            ) : (
              <span className="text-muted-foreground flex h-full w-full items-center justify-center text-lg font-medium">
                {host.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </button>

        {/* Right: Share button (icon only, circular) */}
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0 cursor-pointer rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={handleShare}
        >
          <Send className="size-4" />
        </Button>
      </div>

      <Dialog open={hostModalOpen} onOpenChange={setHostModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About {host.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {host.image && (
              <div className="flex justify-center">
                <div className="relative aspect-square max-h-[50vh] w-full max-w-xs overflow-hidden rounded-full">
                  <Image
                    src={host.image}
                    alt={host.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 384px, 100vw"
                  />
                </div>
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
