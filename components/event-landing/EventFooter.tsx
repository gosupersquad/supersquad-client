"use client";

import Link from "next/link";

const EventFooter = () => {
  return (
    <footer className="border-border text-muted-foreground mt-16 space-y-2 border-t pt-6 pb-10 text-center text-sm md:pb-8">
      <p>
        Powered by <span className="font-extrabold">Supersquad</span>
      </p>

      <p className="text-left">
        <Link
          href="/host/login"
          className="text-foreground underline underline-offset-2 opacity-80"
        >
          Host your event
        </Link>
      </p>
    </footer>
  );
};

export default EventFooter;
