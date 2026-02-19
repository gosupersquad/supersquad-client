"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Pencil, User, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/lib/constants";
import { isMasterForbidden } from "@/lib/master-admin/experiences-client";
import {
  createHost,
  getHost,
  listHosts,
  updateHost,
  type CreateHostPayload,
  type HostListItem,
  type UpdateHostPayload,
} from "@/lib/master-admin/hosts-client";
import { uploadMedia } from "@/lib/upload-client";
import { useAuthStore } from "@/store/auth-store";

const HOSTS_QUERY_KEY = ["master", "hosts"];

const createHostFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore and hyphen"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().max(1000).optional(),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const updateHostFormSchema = createHostFormSchema
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional()
      .or(z.literal("")),
  });

type CreateHostFormValues = z.infer<typeof createHostFormSchema>;
type UpdateHostFormValues = z.infer<typeof updateHostFormSchema>;

const defaultCreateValues: CreateHostFormValues = {
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  instagramUrl: "",
};

function HostCard({
  host,
  onEdit,
}: {
  host: HostListItem;
  onEdit: (id: string) => void;
}) {
  const instagramUrl = host.instagram?.url;

  return (
    <article className="bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm">
      <div className="flex items-center gap-4 p-4">
        <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {host.image ? (
            <Image
              src={host.image}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="text-muted-foreground size-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{host.name}</h3>
          <p className="text-muted-foreground truncate text-sm">
            @{host.username}
          </p>
          {host.bio && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {host.bio}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                host.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {host.isActive ? "Active" : "Inactive"}
            </span>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(host._id)}
          aria-label="Edit host"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    </article>
  );
}

export default function MasterHostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const [createOpen, setCreateOpen] = useState(false);
  const [editHostId, setEditHostId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const createForm = useForm<CreateHostFormValues>({
    resolver: zodResolver(createHostFormSchema),
    defaultValues: defaultCreateValues,
  });

  const updateForm = useForm<UpdateHostFormValues>({
    resolver: zodResolver(updateHostFormSchema),
    defaultValues: {
      ...defaultCreateValues,
      password: "",
    },
  });

  const {
    data: hosts = [],
    isLoading,
    error: listError,
  } = useQuery({
    queryKey: HOSTS_QUERY_KEY,
    queryFn: () => listHosts(token!),
    enabled: !!token && role === ROLES.MASTER,
  });

  const hasHandled403 = useRef(false);
  useEffect(() => {
    if (listError && isMasterForbidden(listError) && !hasHandled403.current) {
      hasHandled403.current = true;
      router.replace("/host/dashboard");
      toast.error("Access denied");
    }
  }, [listError, router]);

  const { data: editHost, isLoading: editHostLoading } = useQuery({
    queryKey: ["master", "host", editHostId],
    queryFn: () => getHost(editHostId!, token!),
    enabled: !!token && !!editHostId && role === ROLES.MASTER,
  });

  useEffect(() => {
    if (editHost) {
      updateForm.reset({
        name: editHost.name,
        username: editHost.username,
        email: editHost.email ?? "",
        password: "",
        bio: editHost.bio ?? "",
        instagramUrl: editHost.instagram?.url ?? "",
      });
    }
  }, [editHost, updateForm]);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateHostPayload) =>
      createHost(payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTS_QUERY_KEY });
      toast.success("Host created");
      setCreateOpen(false);
      createForm.reset(defaultCreateValues);
      setImageFile(null);
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

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateHostPayload;
    }) => updateHost(id, payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["master", "host", editHostId],
      });
      toast.success("Host updated");
      setEditHostId(null);
      setEditImageFile(null);
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

  const onCreateSubmit = async (data: CreateHostFormValues) => {
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
    const payload: CreateHostPayload = {
      name: data.name.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
      image: imageUrl,
      bio: data.bio?.trim() || undefined,
      isActive: true,
      instagram: data.instagramUrl?.trim()
        ? { url: data.instagramUrl.trim() }
        : undefined,
    };
    createMutation.mutate(payload);
  };

  const onUpdateSubmit = async (data: UpdateHostFormValues) => {
    if (!editHostId) return;
    let imageUrl: string | undefined;
    if (editImageFile && token) {
      try {
        const { items } = await uploadMedia([editImageFile], token, "hosts");
        if (items[0]?.url) imageUrl = items[0].url;
      } catch {
        toast.error("Image upload failed");
        return;
      }
    }
    const payload: UpdateHostPayload = {
      name: data.name.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      image: imageUrl,
      bio: data.bio?.trim() || undefined,
      instagram: data.instagramUrl?.trim()
        ? { url: data.instagramUrl.trim() }
        : undefined,
    };
    if (data.password && data.password.length > 0) {
      payload.password = data.password;
    }
    updateMutation.mutate({ id: editHostId, payload });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading hosts…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hosts</h1>
          <p className="text-muted-foreground mt-1">Manage hosts.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-2 size-4" />
          Add host
        </Button>
      </div>

      {hosts.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          No hosts yet. Add your first host to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hosts.map((host) => (
            <HostCard
              key={host._id}
              host={host}
              onEdit={(id) => {
                setEditImageFile(null);
                setEditHostId(id);
              }}
            />
          ))}
        </div>
      )}

      {/* Create host modal */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            createForm.reset(defaultCreateValues);
            setImageFile(null);
          }
        }}
      >
        <DialogContent showCloseButton className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add host</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="flex flex-col gap-4"
          >
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-name">
                      Name <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-name"
                      placeholder="Host name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="username"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-username">
                      Username <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-username"
                      placeholder="username"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-email">
                      Email <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-email"
                      type="email"
                      placeholder="host@example.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-password">
                      Password <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-password"
                      type="password"
                      placeholder="Min 6 characters"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid gap-2">
                <FieldLabel>Image</FieldLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Controller
                name="bio"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-bio">Bio</FieldLabel>
                    <Textarea
                      {...field}
                      id="create-bio"
                      placeholder="Short bio"
                      rows={2}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="instagramUrl"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="create-instagram">
                      Instagram URL
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-instagram"
                      type="url"
                      placeholder="https://instagram.com/..."
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || createForm.formState.isSubmitting
                }
              >
                {(createMutation.isPending ||
                  createForm.formState.isSubmitting) && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Create host
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update host modal */}
      <Dialog
        open={!!editHostId}
        onOpenChange={(open) => {
          if (!open) setEditHostId(null);
        }}
      >
        <DialogContent showCloseButton className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit host</DialogTitle>
          </DialogHeader>
          {editHostLoading && !editHost ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <form
              onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
              className="flex flex-col gap-4"
            >
              <FieldGroup className="gap-4">
                <Controller
                  name="name"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-name">
                        Name <RequiredMark />
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="username"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-username">
                        Username <RequiredMark />
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-username"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-email">
                        Email <RequiredMark />
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="edit-password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid gap-2">
                  <FieldLabel>Image</FieldLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {editHost?.image && !editImageFile && (
                    <p className="text-muted-foreground text-xs">
                      Current image set. Choose a new file to replace.
                    </p>
                  )}
                </div>
                <Controller
                  name="bio"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-bio">Bio</FieldLabel>
                      <Textarea
                        {...field}
                        id="edit-bio"
                        rows={2}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="instagramUrl"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-instagram">
                        Instagram URL
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-instagram"
                        type="url"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditHostId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    updateMutation.isPending ||
                    updateForm.formState.isSubmitting
                  }
                >
                  {(updateMutation.isPending ||
                    updateForm.formState.isSubmitting) && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
