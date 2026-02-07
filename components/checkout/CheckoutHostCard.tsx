"use client";

import type { PublicEventHost } from "@/types";

interface CheckoutHostCardProps {
  host: PublicEventHost;
}

const CheckoutHostCard = ({ host }: CheckoutHostCardProps) => {
  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-3">
      <div className="bg-muted size-12 shrink-0 overflow-hidden rounded-full">
        {host.image ? (
          <img src={host.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-muted-foreground flex h-full w-full items-center justify-center text-lg font-medium">
            {host.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        Hosted by{" "}
        <span className="text-foreground font-medium">{host.name}</span>
      </p>
    </div>
  );
};

export default CheckoutHostCard;
