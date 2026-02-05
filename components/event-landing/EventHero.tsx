"use client";

import { Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";

const EventHero = ({
  title,
  media,
  onShare,
}: {
  title: string;
  media: MediaItem[];
  onShare?: () => void;
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    setTimeout(() => {
      setSelected(api.selectedScrollSnap());
    }, 0);

    api.on("select", () => setSelected(api.selectedScrollSnap()));
  }, [api]);

  const handleShare = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title,
          url: typeof window !== "undefined" ? window.location.href : "",
          text: title,
        })
        .catch(() => {});
    } else if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
    }

    onShare?.();
  }, [title, onShare]);

  if (!media?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="size-4" />
            Share
          </Button>
        </div>

        <div className="aspect-4/3 w-full rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          No media
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop: title + share above carousel */}
      <div className="hidden md:flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
          {title}
        </h1>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleShare}
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </div>

      {/* Mobile: full-bleed 65vh, no padding. Desktop: contained, rounded. */}
      <div className="relative w-screen max-w-none left-1/2 -translate-x-1/2 md:w-full md:left-0 md:translate-x-0 h-[65vh] md:h-auto">
        <Carousel setApi={setApi} className="w-full h-full md:h-auto">
          <CarouselContent className="ml-0 h-full md:h-auto">
            {media.map((item, index) => (
              <CarouselItem
                key={`${item.url}-${index}`}
                className="pl-0 h-full md:h-auto"
              >
                <div className="h-[65vh] w-full overflow-hidden md:h-auto md:aspect-16/10 md:rounded-2xl bg-muted">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      muted
                      loop
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt="event media"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Mobile: title + share over image (above dots) */}
          <div className="flex md:hidden absolute bottom-12 left-4 right-4 z-10 pointer-events-none">
            <h1 className="text-2xl font-semibold tracking-tight text-white drop-shadow-md">
              {title}
            </h1>
            <div className="pointer-events-auto ml-auto">
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
                Share
              </Button>
            </div>
          </div>
          {media.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-1.5 z-10 md:relative md:bottom-0 md:left-0 md:justify-center md:mt-3">
              {media.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    i === selected ? "bg-white" : "bg-white/40",
                  )}
                  onClick={() => api?.scrollTo(i)}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default EventHero;
