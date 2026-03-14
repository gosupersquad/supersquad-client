"use client";

import { Instagram, CalendarPlus, CircleHelp, Home, Info } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/supersquad.club/";
const INSTAGRAM_HANDLE = "@supersquad.club";

const FOOTER_LINKS: Array<{
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string | null;
  external?: boolean;
}> = [
  {
    href: "/",
    icon: Home,
    label: "Home",
    description: null,
  },
  {
    href: "/contact-us",
    icon: CircleHelp,
    label: "Customer Support",
    description: "Billing or app issues? Reach out here.",
  },
  {
    href: INSTAGRAM_URL,
    icon: Instagram,
    label: INSTAGRAM_HANDLE,
    description: null,
    external: true,
  },
  {
    href: "/#about",
    icon: Info,
    label: "About Us",
    description: null,
  },
];

const EventFooter = () => {
  return (
    <footer className="mt-16 px-4 pt-8 pb-10 text-white md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        {/* Host Your Own Event — pill button */}
        <Link
          href="/host/login"
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/20"
        >
          <CalendarPlus className="size-5 shrink-0" aria-hidden />
          Host Your Own Event
        </Link>

        {/* SUPERSQUAD + links */}
        <div className="w-full text-left">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
            SUPERSQUAD
          </h2>

          <ul className="space-y-4">
            {FOOTER_LINKS.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex size-5 shrink-0 items-center justify-center text-white">
                    <Icon className="size-5" />
                  </span>

                  <span className="flex flex-col items-start gap-0.5">
                    <span className="font-medium text-white">{item.label}</span>

                    {item.description && (
                      <span className="text-xs font-normal text-white/70">
                        {item.description}
                      </span>
                    )}
                  </span>
                </>
              );

              const linkClass =
                "flex items-start gap-3 text-sm text-white transition-colors hover:text-white/80";

              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link href={item.href} className={linkClass}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default EventFooter;
