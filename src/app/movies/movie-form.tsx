"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { SearchPicker, type SearchResult } from "@/components/search-picker";
import { StarRating } from "@/components/star-rating";
import { TagInput } from "@/components/tag-input";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { searchMoviesAction, createMovie, updateMovie } from "./actions";
import { toDateInput } from "@/lib/utils";

type Movie = {
  id: number;
  tmdbId: number | null;
  title: string;
  director: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  watchedDate: Date;
  rating: number;
  oneLine: string | null;
  memorable: string | null;
  review: string | null;
  tags: string;
};

type Props = {
  movie?: Movie;
};

export function MovieForm({ movie }: Props) {
  const isEdit = !!movie;
  const [picked, setPicked] = useState<{
    tmdbId: number | null;
    title: string;
    posterUrl: string | null;
    releaseYear: number | null;
  } | null>(
    movie
      ? {
          tmdbId: movie.tmdbId,
          title: movie.title,
          posterUrl: movie.posterUrl,
          releaseYear: movie.releaseYear,
        }
      : null
  );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const onPick = (r: SearchResult) => {
    setPicked({
      tmdbId: parseInt(r.externalId, 10),
      title: r.title,
      posterUrl: r.posterUrl,
      releaseYear: r.subtitle ? parseInt(r.subtitle, 10) : null,
    });
  };

  const onPickFile = (file: File | null) => {
    if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
    if (!file) {
      setUploadedFile(null);
      setUploadedPreview(null);
      return;
    }
    setUploadedFile(file);
    setUploadedPreview(URL.createObjectURL(file));
  };

  const apiPosterUrl = picked?.posterUrl ?? null;
  const displayUrl = uploadedPreview ?? apiPosterUrl;
  const hasUpload = !!uploadedPreview;

  return (
    <div className="space-y-6">
      {!isEdit && (
        <div>
          <Label>TMDB에서 영화 검색</Label>
          <SearchPicker
            searchAction={searchMoviesAction}
            onSelect={onPick}
            placeholder="영화 제목 (예: 기생충)"
            selectedId={picked?.tmdbId ? String(picked.tmdbId) : undefined}
          />
        </div>
      )}

      {(picked || isEdit) && (
        <form
          action={async (fd) => {
            if (uploadedFile) fd.append("coverFile", uploadedFile);
            if (isEdit) await updateMovie(fd);
            else await createMovie(fd);
          }}
          className="space-y-4"
        >
          {isEdit && <input type="hidden" name="id" value={movie!.id} />}
          {picked?.tmdbId && (
            <input type="hidden" name="tmdbId" value={picked.tmdbId} />
          )}
          {apiPosterUrl && !hasUpload && (
            <input type="hidden" name="posterUrl" value={apiPosterUrl} />
          )}
          {picked?.releaseYear && (
            <input
              type="hidden"
              name="releaseYear"
              value={picked.releaseYear}
            />
          )}

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-36 rounded overflow-hidden bg-[var(--muted-bg)] border border-[var(--border)]">
                {displayUrl ? (
                  <Image
                    src={displayUrl}
                    alt={picked?.title || ""}
                    fill
                    sizes="96px"
                    unoptimized={hasUpload}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-xs px-2 text-center">
                    표지 없음
                  </div>
                )}
              </div>
              <CoverUploadButton
                hasCover={!!displayUrl}
                hasUpload={hasUpload}
                onPickFile={onPickFile}
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={picked?.title || ""}
                  required
                />
              </div>
              {isEdit && (
                <div>
                  <Label htmlFor="director">감독</Label>
                  <Input
                    id="director"
                    name="director"
                    defaultValue={movie?.director || ""}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="watchedDate">관람일</Label>
              <Input
                id="watchedDate"
                name="watchedDate"
                type="date"
                defaultValue={
                  movie ? toDateInput(movie.watchedDate) : toDateInput(new Date())
                }
                required
              />
            </div>
            <div>
              <Label>별점</Label>
              <StarRating
                name="rating"
                defaultValue={movie?.rating ?? 0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="oneLine">한줄 평</Label>
            <Input
              id="oneLine"
              name="oneLine"
              defaultValue={movie?.oneLine || ""}
              placeholder="이 영화를 한 문장으로..."
              maxLength={120}
            />
          </div>

          <div>
            <Label htmlFor="memorable">기억에 남는 대사 / 장면</Label>
            <Textarea
              id="memorable"
              name="memorable"
              defaultValue={movie?.memorable || ""}
              placeholder='"인생은 가까이서 보면 비극이지만 멀리서 보면 희극이다"'
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="review">감상평</Label>
            <Textarea
              id="review"
              name="review"
              defaultValue={movie?.review || ""}
              placeholder="자유롭게 적어보세요..."
            />
          </div>

          <div>
            <Label>태그</Label>
            <TagInput
              name="tags"
              defaultTags={movie?.tags ? movie.tags.split(",").filter(Boolean) : []}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {isEdit ? "수정" : "기록 저장"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function CoverUploadButton({
  hasCover,
  hasUpload,
  onPickFile,
}: {
  hasCover: boolean;
  hasUpload: boolean;
  onPickFile: (file: File | null) => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1 items-start">
      <label className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--accent)] cursor-pointer">
        <Upload size={12} />
        {hasCover ? "표지 변경" : "직접 업로드"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {hasUpload && (
        <button
          type="button"
          onClick={() => onPickFile(null)}
          className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <X size={12} />
          취소
        </button>
      )}
    </div>
  );
}
