"use client";

import { useState } from "react";
import { ChevronRight, Instagram } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicEventHost } from "@/types";

const EventInfo = ({ host }: { host: PublicEventHost }) => {
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const instagramUrl = host.instagram?.url;

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
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

        <div className="bg-muted ring-background size-12 shrink-0 overflow-hidden rounded-full ring-2 md:size-14">
          {host.image ? (
            <img
              src={host.image}
              alt="host image"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground flex h-full w-full items-center justify-center text-lg font-medium">
              {host.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
      </div>

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
                  alt="host image"
                  className="mah-[50vh] aspect-square w-full rounded-full object-cover"
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
                <span className="underline">Instagram</span>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EventInfo;
