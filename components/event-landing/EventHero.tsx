"use client";

import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";

const EventHero = ({ title, media }: { title: string; media: MediaItem[] }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    setTimeout(() => {
      setSelected(api.selectedScrollSnap());
    }, 0);

    api.on("select", () => setSelected(api.selectedScrollSnap()));
  }, [api]);

  // Auto-advance when multiple slides (only if loop is enabled)
  useEffect(() => {
    if (!api || media.length <= 1) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api, media.length]);

  if (!media?.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>

        <div className="bg-muted text-muted-foreground flex aspect-4/3 w-full items-center justify-center rounded-2xl">
          No media
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop: title above carousel */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
      </div>

      {/* Carousel */}
      <div className="h-[75vh] w-full md:h-auto">
        <div className="relative h-full w-full">
          <Carousel
            setApi={setApi}
            opts={{ loop: media.length > 1 }}
            className="h-full w-full md:h-auto"
          >
            <CarouselContent className="ml-0 h-full md:h-auto">
              {media.map((item, index) => (
                <CarouselItem
                  key={`${item.url}-${index}`}
                  className="h-full pl-0 md:h-auto"
                >
                  <div className="bg-muted h-[75vh] w-full overflow-hidden md:aspect-16/10 md:h-auto md:rounded-2xl">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
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
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {media.length > 1 && (
              <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 md:relative md:bottom-0 md:left-0 md:mt-3 md:justify-center">
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

          {/* Gradient overlay: fades to page bg #121212 */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
            style={{
              height: "50%",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(18, 18, 18, 0.5) 60%, #121212 100%)",
            }}
          />
        </div>
      </div>

      {/* Mobile only: title after carousel, above host info */}
      <div className="flex px-4 pt-4 md:hidden md:px-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
    </div>
  );
};

export default EventHero;
