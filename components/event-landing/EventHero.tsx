"use client";

import Image from "next/image";
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
      {/* Carousel */}
      <div className="h-[50vh] w-full">
        <div className="relative h-full w-full">
          <Carousel
            setApi={setApi}
            opts={{ loop: media.length > 1 }}
            className="h-full w-full"
          >
            <CarouselContent className="ml-0 h-full">
              {media.map((item, index) => (
                <CarouselItem
                  key={`${item.url}-${index}`}
                  className="h-full pl-0"
                >
                  <div className="bg-muted relative h-[50vh] w-full overflow-hidden rounded-2xl">
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
                      <Image
                        src={item.url}
                        alt="event media"
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Dots indicator for carousel slides */}
            {media.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
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

      {/* Mobile only: title after carousel, above host info */}
      <div className="flex px-4 pt-4 md:hidden md:px-0">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
    </div>
  );
};

export default EventHero;
