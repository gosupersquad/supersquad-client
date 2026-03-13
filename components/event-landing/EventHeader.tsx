"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "../ui/button";

const EventHeader = () => {
  return (
    <header className="sticky top-0 z-10 mt-2 mb-1 flex items-center justify-between py-4 backdrop-blur">
      <Link
        href="#"
        className="text-foreground text-lg font-semibold tracking-tight"
      >
        <Image
          src="/supersquad-logo.svg"
          alt="Supersquad"
          width={100}
          height={20}
        />
      </Link>

      <Button variant="ghost" className="-mr-3 cursor-pointer">
        <Menu className="size-8 text-[#8A8383]" />
      </Button>
    </header>
  );
};

export default EventHeader;
