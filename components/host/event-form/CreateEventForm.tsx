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
  const reset = useEventFormStore((s) => s.reset);

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => {
      if (!token) throw new Error("Not signed in");
      return createEvent(payload, token);
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      router.push("/host/experiences");
      toast.success("Event created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    },
  });

  return (
    <EventFormBase
      onSubmit={(payload) => mutation.mutate(payload)}
      submitLabel="Create event"
      submitLoadingLabel="Creating…"
      isSubmitting={mutation.isPending}
    />
  );
};

export default CreateEventForm;
