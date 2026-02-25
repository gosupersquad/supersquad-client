"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { createEvent } from "@/lib/experiences-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { CreateEventPayload } from "@/types";

import EventFormBase from "./EventFormBase";

const CreateEventForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.user?.username);
  const reset = useEventFormStore((s) => s.reset);

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => {
      if (!token) throw new Error("Not signed in");
      return createEvent(payload, token);
    },
    onSuccess: (event) => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Event created");

      if (username && event?.slug) {
        router.replace(
          `/hosts/${encodeURIComponent(username)}/events/${encodeURIComponent(event.slug)}`,
        );
      } else {
        router.replace("/host/experiences");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    },
  });

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <EventFormBase
      mode="create"
      onSubmit={(payload) => mutation.mutate(payload)}
      isSubmitting={mutation.isPending}
    />
  );
};

export default CreateEventForm;
