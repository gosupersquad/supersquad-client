"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import HostFormBase, {
  defaultCreateValues,
} from "@/components/host/host-form/HostFormBase";
import {
  createHost,
  type CreateHostPayload,
} from "@/lib/master-admin/hosts-client";
import { uploadMedia } from "@/lib/upload-client";
import { useAuthStore } from "@/store/auth-store";

export interface CreateHostFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

const CreateHostForm = ({ onSuccess, onCancel }: CreateHostFormProps) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const mutation = useMutation({
    mutationFn: async (payload: CreateHostPayload) => {
      if (!token) throw new Error("Not signed in");
      return createHost(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", "hosts"] });
      toast.success("Host created");
      onSuccess?.();
    },
    onError: (e: Error) => {
      const msg =
        axios.isAxiosError(e) &&
        typeof e.response?.data === "object" &&
        e.response?.data !== null &&
        "message" in e.response.data
          ? String((e.response.data as { message?: string }).message)
          : e.message;

      toast.error(msg || "Failed to create host");
    },
  });

  const handleSubmit = async (
    payload:
      | CreateHostPayload
      | import("@/lib/master-admin/hosts-client").UpdateHostPayload,
    imageFile: File | null,
  ) => {
    const createPayload = payload as CreateHostPayload;
    let imageUrl: string | undefined;

    if (imageFile && token) {
      try {
        const { items } = await uploadMedia([imageFile], token, "hosts");
        if (items[0]?.url) imageUrl = items[0].url;
      } catch {
        toast.error("Image upload failed");
        return;
      }
    }
    await mutation.mutateAsync({ ...createPayload, image: imageUrl });
  };

  return (
    <HostFormBase
      mode="create"
      defaultValues={defaultCreateValues}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      onCancel={onCancel}
      idPrefix="create"
    />
  );
};

export default CreateHostForm;
