"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicEventHost } from "@/types";

interface EventContactHostProps {
  host: PublicEventHost;
}

const EventContactHost = ({ host }: EventContactHostProps) => {
  const link = host.whatsappContactLink;

  const handleContact = () => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="my-10">
      <p className="text-muted-foreground text-center text-sm font-normal">
        Have a question about the event?
        <br />
        Feel free to message the host
      </p>

      {link && (
        <Button
          type="button"
          variant="outline"
          className="mx-auto mt-3 flex justify-center rounded-full border-white/10 bg-white/5 hover:bg-white/10"
          onClick={handleContact}
        >
          <Send className="size-4" />
          Contact host
        </Button>
      )}
    </section>
  );
};

export default EventContactHost;
