"use client";

import Link from "next/link";

const EventHeader = () => {
  return (
    <header className="sticky top-0 z-10 hidden md:flex items-center px-4 py-4 md:px-6 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        SUPERSQUAD
      </Link>
    </header>
  );
};

export default EventHeader;
