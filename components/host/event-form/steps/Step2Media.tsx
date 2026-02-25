"use client";

import { Loader2, Upload, X } from "lucide-react";
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

const DEFAULT_MAX = 6;

export interface EventMediaUploadProps {
  /** Max number of items (default 6). */
  maxItems?: number;
}

/**
 * Media upload for event form: 3-column grid of thumbnails with remove (X) on each,
 * dropzone below, and count. Uses event form store (media, setMedia).
 */
const EventMediaUpload = ({
  maxItems = DEFAULT_MAX,
}: EventMediaUploadProps) => {
  const token = useAuthStore((s) => s.token);
  const { media, setMedia } = useEventFormStore();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || !token) return;

      const current = useEventFormStore.getState().media;
      if (current.length >= maxItems) return;

      setIsUploading(true);
      try {
        const { items } = await uploadMedia(acceptedFiles, token);
        const next = [...current, ...items].slice(0, maxItems);

        setMedia(next);
        if (next.length > current.length) {
          toast.success(`Added ${next.length - current.length} file(s)`);
        }

        if (items.length > next.length - current.length) {
          toast(`Only ${maxItems} items allowed; some were not added.`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [token, setMedia, maxItems],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    disabled: isUploading || !token || media.length >= maxItems,
  });

  const removeAt = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const canAdd = media.length < maxItems;

  return (
    <FieldGroup className="gap-4">
      <FieldLabel>Media</FieldLabel>
      <p className="text-muted-foreground text-sm">
        Make it real. Drop in images or video that capture what your
        event&apos;s all about.
      </p>

      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {media.map((item, index) => (
            <MediaGridCell
              key={`${item.url}-${index}`}
              item={item}
              onRemove={() => removeAt(index)}
            />
          ))}
        </div>
      )}

      {canAdd && (
        <div
          {...getRootProps()}
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50"
          } ${isUploading || !token ? "pointer-events-none opacity-60" : ""}`}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <Loader2
              className="text-muted-foreground size-8 animate-spin"
              aria-hidden
            />
          ) : (
            <Upload className="text-muted-foreground size-8" aria-hidden />
          )}

          <p className="text-foreground text-center text-sm font-medium">
            {isUploading ? "Uploading…" : "Drag & drop or click to add media"}
          </p>
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        {media.length}/{maxItems} added
      </p>

      {!token && (
        <p className="text-destructive text-sm">
          You must be signed in to upload media.
        </p>
      )}
    </FieldGroup>
  );
};

const MediaGridCell = ({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) => {
  return (
    <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
      {item.type === "image" ? (
        <Image
          src={item.url}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 33vw, 200px"
        />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-sm font-medium">
          Video
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 size-8 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};

export default EventMediaUpload;
