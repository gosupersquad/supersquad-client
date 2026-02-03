"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { uploadMedia } from "@/lib/upload-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { MediaItem } from "@/types";

const Step2Media = () => {
  const token = useAuthStore((s) => s.token);

  const { media, setMedia, nextStep, prevStep } = useEventFormStore();
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !token) return;

    e.target.value = "";
    setIsUploading(true);

    try {
      const fileList = Array.from(files);
      const { items } = await uploadMedia(fileList, token);

      setMedia([...media, ...items]);
      toast.success(`Added ${items.length} file(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    e.target.value = "";
    setIsUploading(true);

    try {
      const { items } = await uploadMedia([file], token);
      setMedia([...media, ...items]);

      toast.success("Video added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeItem = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <FieldGroup className="gap-4">
        <FieldLabel>Media (images &amp; video)</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Add images and optionally one video. Order is preserved. You can skip
          this step and add media later.
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

        <div className="flex flex-wrap gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleAddImages}
            disabled={isUploading || !token}
          />

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleAddVideo}
            disabled={isUploading || !token}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading || !token}
          >
            {isUploading ? "Uploading…" : "Add images"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading || !token}
          >
            Add video
          </Button>
        </div>

        {!token && (
          <p className="text-destructive text-sm">
            You must be signed in to upload media.
          </p>
        )}
      </FieldGroup>

      <div className="flex gap-3 pt-2">
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
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.type === "image" ? (
          <Image
            src={item.url}
            alt=""
            className="size-full object-cover"
            width={100}
            height={100}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
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
