import Link from "next/link";

import { Button } from "../ui/button";

interface FooterActionBtnProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

/**
 * A button that is used in the footer of the event card.
 * @param href - The href of the button.
 * @param icon - The icon of the button.
 * @param label - The label of the button.
 */
const FooterActionBtn = ({ href, icon, label }: FooterActionBtnProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex h-8 items-center border-0 bg-black/50 text-white/90 shadow-sm hover:bg-black/80"
      asChild
    >
      <Link href={href}>
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
};

export default FooterActionBtn;
