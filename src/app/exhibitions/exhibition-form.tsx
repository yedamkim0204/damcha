"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { TagInput } from "@/components/tag-input";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { createExhibition, updateExhibition } from "./actions";
import { toDateInput, parsePhotos, serializePhotos } from "@/lib/utils";

type Exhibition = {
  id: number;
  title: string;
  venue: string | null;
  artist: string | null;
  visitDate: Date;
  rating: number;
  review: string | null;
  tags: string;
  photos: string;
};

type Props = {
  exhibition?: Exhibition;
};

export function ExhibitionForm({ exhibition }: Props) {
  const isEdit = !!exhibition;
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    exhibition ? parsePhotos(exhibition.photos) : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewFiles((prev) => [...prev, ...arr]);
    setNewPreviews((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExisting = (url: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  };

  return (
    <form
      action={async (fd) => {
        for (const f of newFiles) {
          fd.append("photos", f);
        }
        if (isEdit) {
          fd.set("existingPhotos", serializePhotos(existingPhotos));
          await updateExhibition(fd);
        } else {
          await createExhibition(fd);
        }
      }}
      className="space-y-4"
    >
      {isEdit && <input type="hidden" name="id" value={exhibition!.id} />}

      <div>
        <Label htmlFor="title">전시 제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={exhibition?.title || ""}
          placeholder="예: 모네: 빛을 그리다"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue">장소</Label>
          <Input
            id="venue"
            name="venue"
            defaultValue={exhibition?.venue || ""}
            placeholder="예: 국립현대미술관"
          />
        </div>
        <div>
          <Label htmlFor="artist">작가</Label>
          <Input
            id="artist"
            name="artist"
            defaultValue={exhibition?.artist || ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="visitDate">관람일</Label>
          <Input
            id="visitDate"
            name="visitDate"
            type="date"
            defaultValue={
              exhibition
                ? toDateInput(exhibition.visitDate)
                : toDateInput(new Date())
            }
            required
          />
        </div>
        <div>
          <Label>별점</Label>
          <StarRating name="rating" defaultValue={exhibition?.rating ?? 0} />
        </div>
      </div>

      <div>
        <Label>사진</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
          {existingPhotos.map((url) => (
            <div key={url} className="relative aspect-square">
              <Image
                src={url}
                alt=""
                fill
                sizes="120px"
                className="object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                aria-label="사진 제거"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={src} className="relative aspect-square">
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                unoptimized
                className="object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                aria-label="사진 제거"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-[var(--border)] rounded flex items-center justify-center text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-colors">
            <Upload size={20} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </label>
        </div>
        <p className="text-xs text-[var(--muted)]">
          최대 8MB · jpg/png/webp/gif
        </p>
      </div>

      <div>
        <Label htmlFor="review">감상평</Label>
        <Textarea
          id="review"
          name="review"
          defaultValue={exhibition?.review || ""}
          placeholder="기억에 남는 작품, 분위기..."
        />
      </div>

      <div>
        <Label>태그</Label>
        <TagInput
          name="tags"
          defaultTags={
            exhibition?.tags
              ? exhibition.tags.split(",").filter(Boolean)
              : []
          }
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">{isEdit ? "수정" : "기록 저장"}</Button>
      </div>
    </form>
  );
}
