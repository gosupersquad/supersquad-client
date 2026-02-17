import { getPublicEvent } from "@/lib/public-event-client";
import CheckoutContent from "@/components/checkout/CheckoutContent";

type Props = {
  params: Promise<{ username: string; eventSlug: string }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const { username, eventSlug } = await params;

  try {
    const event = await getPublicEvent(username, eventSlug);
    if (!event?.isActive) return { title: "Checkout" };

    return { title: `Checkout - ${event.title}` };
  } catch {
    return { title: "Checkout" };
  }
};

const EventCheckoutPage = () => {
  return <CheckoutContent />;
};

export default EventCheckoutPage;
