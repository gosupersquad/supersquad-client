"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import HostFormBase, {
  type UpdateHostFormValues,
} from "@/components/host/host-form/HostFormBase";
import {
  getHost,
  updateHost,
  type CreateHostPayload,
  type UpdateHostPayload,
} from "@/lib/master-admin/hosts-client";
import { uploadMedia } from "@/lib/upload-client";
import { useAuthStore } from "@/store/auth-store";

export interface EditHostFormProps {
  hostId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

const EditHostForm = ({ hostId, onSuccess, onCancel }: EditHostFormProps) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const { data: host, isLoading } = useQuery({
    queryKey: ["master", "host", hostId],
    queryFn: () => getHost(hostId, token!),
    enabled: !!token && !!hostId,
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateHostPayload;
    }) => updateHost(id, payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", "hosts"] });
      queryClient.invalidateQueries({ queryKey: ["master", "host", hostId] });

      toast.success("Host updated");
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

      toast.error(msg || "Failed to update host");
    },
  });

  const handleSubmit = async (
    payload: CreateHostPayload | UpdateHostPayload,
    imageFile: File | null,
  ) => {
    const updatePayload = payload as UpdateHostPayload;
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

    mutation.mutate({
      id: hostId,
      payload: {
        ...updatePayload,
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });
  };

  const defaultValues: UpdateHostFormValues | null = host
    ? {
        name: host.name,
        username: host.username,
        email: host.email ?? "",
        password: "",
        bio: host.bio ?? "",
        instagramUrl: host.instagram?.url ?? "",
        isActive: host.isActive,
      }
    : null;

  if (isLoading || !host) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading host…</span>
        </div>
      </div>
    );
  }

  if (!defaultValues) return null;

  return (
    <HostFormBase
      mode="edit"
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      onCancel={onCancel}
      idPrefix="edit"
      existingImageUrl={host.image}
    />
  );
};

export default EditHostForm;
