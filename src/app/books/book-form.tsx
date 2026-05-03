"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { SearchPicker, type SearchResult } from "@/components/search-picker";
import { StarRating } from "@/components/star-rating";
import { TagInput } from "@/components/tag-input";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { searchBooksAction, createBook, updateBook } from "./actions";
import { toDateInput } from "@/lib/utils";

type Book = {
  id: number;
  googleId: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  coverUrl: string | null;
  finishedDate: Date;
  rating: number;
  review: string | null;
  tags: string;
};

type Props = {
  book?: Book;
};

export function BookForm({ book }: Props) {
  const isEdit = !!book;
  const [picked, setPicked] = useState<{
    googleId: string | null;
    title: string;
    author: string | null;
    coverUrl: string | null;
  } | null>(
    book
      ? {
          googleId: book.googleId,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
        }
      : null
  );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const onPick = (r: SearchResult) => {
    setPicked({
      googleId: r.externalId,
      title: r.title,
      author: r.subtitle ?? null,
      coverUrl: r.posterUrl,
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

  const apiCoverUrl = picked?.coverUrl ?? null;
  const displayUrl = uploadedPreview ?? apiCoverUrl;
  const hasUpload = !!uploadedPreview;

  return (
    <div className="space-y-6">
      {!isEdit && (
        <div>
          <Label>Google Books에서 책 검색</Label>
          <SearchPicker
            searchAction={searchBooksAction}
            onSelect={onPick}
            placeholder="책 제목 또는 저자"
            selectedId={picked?.googleId ?? undefined}
          />
        </div>
      )}

      {(picked || isEdit) && (
        <form
          action={async (fd) => {
            if (uploadedFile) fd.append("coverFile", uploadedFile);
            if (isEdit) await updateBook(fd);
            else await createBook(fd);
          }}
          className="space-y-4"
        >
          {isEdit && <input type="hidden" name="id" value={book!.id} />}
          {picked?.googleId && (
            <input type="hidden" name="googleId" value={picked.googleId} />
          )}
          {apiCoverUrl && !hasUpload && (
            <input type="hidden" name="coverUrl" value={apiCoverUrl} />
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
              <div>
                <Label htmlFor="author">저자</Label>
                <Input
                  id="author"
                  name="author"
                  defaultValue={picked?.author || ""}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finishedDate">완독일</Label>
              <Input
                id="finishedDate"
                name="finishedDate"
                type="date"
                defaultValue={
                  book
                    ? toDateInput(book.finishedDate)
                    : toDateInput(new Date())
                }
                required
              />
            </div>
            <div>
              <Label>별점</Label>
              <StarRating name="rating" defaultValue={book?.rating ?? 0} />
            </div>
          </div>

          <div>
            <Label htmlFor="review">감상평</Label>
            <Textarea
              id="review"
              name="review"
              defaultValue={book?.review || ""}
              placeholder="인상 깊었던 구절, 느낀 점..."
            />
          </div>

          <div>
            <Label>태그</Label>
            <TagInput
              name="tags"
              defaultTags={book?.tags ? book.tags.split(",").filter(Boolean) : []}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">{isEdit ? "수정" : "기록 저장"}</Button>
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
