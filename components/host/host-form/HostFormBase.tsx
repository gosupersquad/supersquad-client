"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateHostPayload,
  UpdateHostPayload,
} from "@/lib/master-admin/hosts-client";

const createHostFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore and hyphen"),

  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  bio: z.string().max(1000).optional(),
  instagramUrl: z.url("Invalid URL").optional().or(z.literal("")),

  isActive: z.boolean().optional(),
});

const updateHostFormSchema = createHostFormSchema
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional()
      .or(z.literal("")),
    isActive: z.boolean().optional(),
  });

export type CreateHostFormValues = z.infer<typeof createHostFormSchema>;
export type UpdateHostFormValues = z.infer<typeof updateHostFormSchema>;

const defaultCreateValues: CreateHostFormValues = {
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  instagramUrl: "",
  isActive: true,
};

export interface HostFormBaseProps {
  mode: "create" | "edit";
  defaultValues: CreateHostFormValues | UpdateHostFormValues;

  onSubmit: (
    payload: CreateHostPayload | UpdateHostPayload,
    imageFile: File | null,
  ) => void | Promise<void>;

  isSubmitting: boolean;
  onCancel: () => void;

  idPrefix: string;
  existingImageUrl?: string;
}

const submitLabel = (mode: "create" | "edit") =>
  mode === "edit" ? "Save changes" : "Create host";

const submitLoadingLabel = (mode: "create" | "edit") =>
  mode === "edit" ? "Saving…" : "Creating…";

const HostFormBase = ({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  idPrefix,
  existingImageUrl,
}: HostFormBaseProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const schema =
    mode === "create" ? createHostFormSchema : updateHostFormSchema;

  const form = useForm<CreateHostFormValues | UpdateHostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as CreateHostFormValues,
  });

  useEffect(() => {
    form.reset(defaultValues as CreateHostFormValues);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (mode === "create") {
      const payload: CreateHostPayload = {
        name: data.name.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
        password: (data as CreateHostFormValues).password,
        bio: data.bio?.trim() || undefined,
        isActive: (data as CreateHostFormValues).isActive ?? true,
        instagram: data.instagramUrl?.trim()
          ? { url: data.instagramUrl.trim() }
          : undefined,
      };

      await Promise.resolve(onSubmit(payload, imageFile));
    } else {
      const d = data as UpdateHostFormValues;

      const payload: UpdateHostPayload = {
        name: d.name.trim(),
        username: d.username.trim(),
        email: d.email.trim(),
        bio: d.bio?.trim() || undefined,
        isActive: d.isActive,
        instagram: d.instagramUrl?.trim()
          ? { url: d.instagramUrl.trim() }
          : undefined,
      };

      if (d.password && d.password.length > 0) payload.password = d.password;
      await Promise.resolve(onSubmit(payload, imageFile));
    }
  });

  const p = (name: string) => `${idPrefix}-${name}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("name")}>
                Name <RequiredMark />
              </FieldLabel>
              <Input
                {...field}
                id={p("name")}
                placeholder="Host name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("username")}>
                Username <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id={p("username")}
                placeholder="username"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("email")}>
                Email <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id={p("email")}
                type="email"
                placeholder="host@example.com"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("password")}>
                {mode === "create" ? (
                  <>
                    Password <RequiredMark />
                  </>
                ) : (
                  "Password"
                )}
              </FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={p("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "create"
                      ? "Min 6 characters"
                      : "Leave blank to keep current"
                  }
                  aria-invalid={fieldState.invalid}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
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

          {mode === "edit" && existingImageUrl && !imageFile && (
            <p className="text-muted-foreground text-xs">
              Current image set. Choose a new file to replace.
            </p>
          )}
        </div>

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("bio")}>Bio</FieldLabel>

              <Textarea
                {...field}
                id={p("bio")}
                placeholder="Short bio"
                rows={2}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="instagramUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={p("instagram")}>Instagram URL</FieldLabel>

              <Input
                {...field}
                id={p("instagram")}
                type="url"
                placeholder="https://instagram.com/..."
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field className="flex flex-row items-center justify-between gap-4">
              <FieldLabel htmlFor={p("isActive")}>Active</FieldLabel>

              <Switch
                id={p("isActive")}
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || form.formState.isSubmitting}
        >
          {(isSubmitting || form.formState.isSubmitting) && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}

          {isSubmitting || form.formState.isSubmitting
            ? submitLoadingLabel(mode)
            : submitLabel(mode)}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default HostFormBase;
export { defaultCreateValues };
