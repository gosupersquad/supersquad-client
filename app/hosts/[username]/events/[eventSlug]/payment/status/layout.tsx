import { getPublicEvent } from "@/lib/public-event-client";

type Props = {
  params: Promise<{ username: string; eventSlug: string }>;
  children: React.ReactNode;
};

export const generateMetadata = async ({ params }: Props) => {
  const { username, eventSlug } = await params;

  try {
    const event = await getPublicEvent(username, eventSlug);
    if (!event?.isActive) return { title: "Payment status" };

    return { title: `Payment status - ${event.title}` };
  } catch {
    return { title: "Payment status" };
  }
};

export default function PaymentStatusLayout({ children }: Props) {
  return children;
}
