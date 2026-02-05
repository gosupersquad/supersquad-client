"use client";

import Link from "next/link";

const EventFooter = () => {
  return (
    <footer className="border-t border-border pt-6 pb-24 md:pb-8 mt-10 text-center text-sm text-muted-foreground space-y-2">
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
