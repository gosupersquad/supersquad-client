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
import Image from "next/image";

const EventInfo = ({ host }: { host: PublicEventHost }) => {
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const instagramUrl = host.instagram?.url;

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Hosted by {host.name}</p>

          <button
            type="button"
            onClick={() => setHostModalOpen(true)}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline mt-0.5"
          >
            Know more
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="size-12 md:size-14 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-background">
          {host.image ? (
            <Image
              src={host.image}
              alt="host image"
              className="object-cover"
              width={48}
              height={48}
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
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
                <Image
                  src={host.image}
                  alt="host image"
                  className="rounded-full object-cover"
                  width={200}
                  height={200}
                />
              </div>
            )}

            {host.bio && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {host.bio}
              </p>
            )}

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
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
