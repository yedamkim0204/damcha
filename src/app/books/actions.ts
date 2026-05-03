"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { searchBooks, getBookDetail } from "@/lib/google-books";
import { serializeTags } from "@/lib/utils";
import { saveUpload, deleteUpload } from "@/lib/uploads";
import type { SearchResult } from "@/components/search-picker";

export async function searchBooksAction(query: string): Promise<SearchResult[]> {
  const results = await searchBooks(query);
  return results.map((b) => ({
    externalId: b.id,
    title: b.title,
    subtitle: b.author,
    posterUrl: b.coverUrl,
  }));
}

const bookSchema = z.object({
  googleId: z.string().optional().nullable(),
  title: z.string().min(1, "제목을 입력해주세요"),
  author: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  finishedDate: z.string().min(1, "완독일을 입력해주세요"),
  rating: z.string().transform((v) => parseInt(v, 10)),
  review: z.string().optional().nullable(),
  tags: z.string().optional().default(""),
});

async function extractCoverFile(formData: FormData): Promise<string | null> {
  const file = formData.get("coverFile");
  if (!(file instanceof File) || file.size === 0) return null;
  return await saveUpload(file);
}

function rawFromFormData(formData: FormData): Record<string, FormDataEntryValue> {
  const raw: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "coverFile") continue;
    raw[key] = value;
  }
  return raw;
}

export async function createBook(formData: FormData) {
  const data = bookSchema.parse(rawFromFormData(formData));

  const uploadedUrl = await extractCoverFile(formData);
  let coverUrl = uploadedUrl ?? data.coverUrl ?? null;
  let author = data.author || null;
  let publisher = data.publisher || null;
  let isbn = data.isbn || null;

  if (data.googleId) {
    try {
      const detail = await getBookDetail(data.googleId);
      author = author || detail.author;
      publisher = publisher || detail.publisher;
      isbn = isbn || detail.isbn;
      if (!coverUrl) coverUrl = detail.coverUrl;
    } catch {
      // ignore enrichment failure
    }
  }

  const book = await prisma.book.create({
    data: {
      googleId: data.googleId || null,
      title: data.title,
      author,
      publisher,
      isbn,
      coverUrl,
      finishedDate: new Date(data.finishedDate),
      rating: data.rating,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
    },
  });

  revalidatePath("/books");
  revalidatePath("/");
  redirect(`/books/${book.id}`);
}

const bookUpdateSchema = bookSchema.extend({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export async function updateBook(formData: FormData) {
  const data = bookUpdateSchema.parse(rawFromFormData(formData));

  const uploadedUrl = await extractCoverFile(formData);
  let coverUrl = data.coverUrl || null;

  if (uploadedUrl) {
    const existing = await prisma.book.findUnique({
      where: { id: data.id },
      select: { coverUrl: true },
    });
    if (existing?.coverUrl) await deleteUpload(existing.coverUrl);
    coverUrl = uploadedUrl;
  }

  await prisma.book.update({
    where: { id: data.id },
    data: {
      title: data.title,
      author: data.author || null,
      publisher: data.publisher || null,
      isbn: data.isbn || null,
      coverUrl,
      finishedDate: new Date(data.finishedDate),
      rating: data.rating,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
    },
  });

  revalidatePath("/books");
  revalidatePath(`/books/${data.id}`);
  revalidatePath("/");
  redirect(`/books/${data.id}`);
}

export async function deleteBook(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const book = await prisma.book.findUnique({
    where: { id },
    select: { coverUrl: true },
  });
  if (book?.coverUrl) await deleteUpload(book.coverUrl);
  await prisma.book.delete({ where: { id } });
  revalidatePath("/books");
  revalidatePath("/");
  redirect("/books");
}
