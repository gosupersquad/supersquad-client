import Link, { LinkProps } from "next/link";

import { Button } from "../ui/button";
import { AnchorHTMLAttributes } from "react";

interface FooterActionBtnProps {
  href: string;
  icon: React.ReactNode;
  label?: string;
  linkProps?: Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof LinkProps<boolean>
  >;
}

/**
 * A button that is used in the footer of the event card.
 * @param href - The href of the button.
 * @param icon - The icon of the button.
 * @param label - The label of the button.
 */
const FooterActionBtn = ({
  href,
  icon,
  label,
  linkProps,
}: FooterActionBtnProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex h-8 items-center border-0 bg-black/50 text-white/90 shadow-sm hover:bg-black/80"
      asChild
    >
      <Link href={href} {...linkProps}>
        {icon}
        {label ? <span>{label}</span> : null}
      </Link>
    </Button>
  );
};

export default FooterActionBtn;
