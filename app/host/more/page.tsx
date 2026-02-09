import { FileText, Ticket } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "More",
  description: "Leads, coupons, and more",
};

type MoreLink = {
  label: string;
  href: string;
  icon: React.ElementType;
  comingSoon?: boolean;
};

// Links that don’t need a tab each; add more when in scope (e.g. Bookings)
const MORE_LINKS: MoreLink[] = [
  { label: "Leads", href: "/host/leads", icon: FileText },
  { label: "Discount codes", href: "/host/discount-codes", icon: Ticket },
] as const;

const HostMorePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">More</h1>

      <p className="text-muted-foreground mt-1">
        Leads, coupons, and other tools. Add more links here as we add features.
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {MORE_LINKS.map(({ label, href, icon: Icon, comingSoon }) => (
          <li key={href}>
            {comingSoon ? (
              <span className="border-border text-muted-foreground flex items-center gap-2 rounded-lg border px-4 py-3">
                <Icon className="size-4" />
                {label}

                <span className="text-xs">(coming soon)</span>
              </span>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HostMorePage;
