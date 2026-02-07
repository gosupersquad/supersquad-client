"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { uploadMedia } from "@/lib/upload-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { MediaItem } from "@/types";

const ACCEPT = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  "video/*": [".mp4", ".webm", ".mov"],
};

const Step2Media = () => {
  const token = useAuthStore((s) => s.token);
  const { media, setMedia, nextStep, prevStep } = useEventFormStore();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || !token) return;
      setIsUploading(true);

      try {
        const { items } = await uploadMedia(acceptedFiles, token);
        const current = useEventFormStore.getState().media;

        setMedia([...current, ...items]);
        toast.success(`Added ${items.length} file(s)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },

    [token, setMedia],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    disabled: isUploading || !token,
  });

  const removeItem = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <FieldGroup className="gap-4">
        <FieldLabel>Media</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Add images and videos. Order is preserved. You can skip this step and
          add media later.
        </p>

        {media.length > 0 && (
          <ul className="flex flex-col gap-3">
            {media.map((item, index) => (
              <MediaRow
                key={`${item.url}-${index}`}
                item={item}
                onRemove={() => removeItem(index)}
              />
            ))}
          </ul>
        )}

        <div
          {...getRootProps()}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50"
          } ${isUploading || !token ? "pointer-events-none opacity-60" : ""}`}
        >
          <input {...getInputProps()} />

          <Upload className="text-muted-foreground size-10" aria-hidden />

          <p className="text-foreground text-center text-sm font-medium">
            {isUploading
              ? "Uploading…"
              : "Drag & drop files here, or click to select"}
          </p>

          <p className="text-muted-foreground text-center text-xs">
            Supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, MOV)
          </p>
        </div>

        {!token && (
          <p className="text-destructive text-sm">
            You must be signed in to upload media.
          </p>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>

        <Button type="button" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
};

const MediaRow = ({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) => {
  return (
    <li className="border-border bg-card flex items-center gap-3 rounded-lg border p-3">
      <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-md">
        {item.type === "image" ? (
          // <img src={item.url} alt="" className="size-full object-cover" />
          <Image
            src={item.url}
            alt="image"
            className="size-full object-cover"
            width={60}
            height={60}
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <span className="text-xs font-medium">Video</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground text-xs font-medium uppercase">
          {item.type}
        </span>
        <p className="truncate text-sm">{item.url}</p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
      >
        Remove
      </Button>
    </li>
  );
};

export default Step2Media;
