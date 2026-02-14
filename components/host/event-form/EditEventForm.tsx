"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EventFormBase from "@/components/host/event-form/EventFormBase";
import { getEvent, updateEvent } from "@/lib/experiences-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { CreateEventPayload, UpdateEventPayload } from "@/types";

interface EditEventFormProps {
  eventId: string;
}

const EditEventForm = ({ eventId }: EditEventFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [prefilled, setPrefilled] = useState(false);

  const token = useAuthStore((s) => s.token);
  const {
    setBasics,
    setMedia,
    setFaqs,
    setTickets,
    setCustomQuestions,
    setStep,
    reset,
  } = useEventFormStore();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["experiences", eventId],
    queryFn: () => {
      const t = useAuthStore.getState().token;
      if (!t || !eventId) throw new Error("Not signed in or missing event id");
      return getEvent(eventId, t);
    },
    enabled: !!token && !!eventId,
  });

  useEffect(() => {
    if (!event) return;

    const startDate =
      typeof event.startDate === "string" ? event.startDate.slice(0, 10) : "";

    const endDate =
      typeof event.endDate === "string" ? event.endDate.slice(0, 10) : "";

    setBasics({
      title: event.title,
      slug: event.slug ?? "",
      location: event.location,
      description: event.description,
      spotsAvailable: event.spotsAvailable,
      startDate,
      endDate,
      dateDisplayText: event.dateDisplayText ?? "",
      isFreeRsvp: event.isFreeRsvp ?? false,
      isActive: event.isActive,
    });
    setMedia(event.media ?? []);
    setFaqs(event.faqs ?? []);
    setTickets(
      event.tickets?.length
        ? event.tickets
        : [{ code: "standard", label: "Standard", price: 0, currency: "INR" }],
    );
    setCustomQuestions(event.customQuestions ?? []);
    setStep(1);
    setTimeout(() => setPrefilled(true), 100);
  }, [
    event,
    setBasics,
    setMedia,
    setFaqs,
    setTickets,
    setCustomQuestions,
    setStep,
  ]);

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => {
      if (!token) throw new Error("Not signed in");
      const updatePayload: UpdateEventPayload = payload;
      return updateEvent(eventId, updatePayload, token);
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      router.push("/host/experiences");
      toast.success("Event updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading event…</span>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load event."}
        </p>
      </div>
    );
  }

  if (!prefilled) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading event…</span>
        </div>
      </div>
    );
  }

  return (
    <EventFormBase
      onSubmit={(payload) => mutation.mutate(payload)}
      submitLabel="Update event"
      submitLoadingLabel="Updating…"
      isSubmitting={mutation.isPending}
    />
  );
};

export default EditEventForm;
