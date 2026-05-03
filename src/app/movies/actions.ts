"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { searchMovies, getMovieDetail } from "@/lib/tmdb";
import { serializeTags } from "@/lib/utils";
import { saveUpload, deleteUpload } from "@/lib/uploads";
import type { SearchResult } from "@/components/search-picker";

export async function searchMoviesAction(
  query: string
): Promise<SearchResult[]> {
  const results = await searchMovies(query);
  return results.map((r) => ({
    externalId: String(r.id),
    title: r.title,
    subtitle: r.releaseYear ? `${r.releaseYear}` : null,
    posterUrl: r.posterUrl,
  }));
}

const movieSchema = z.object({
  tmdbId: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : null)),
  title: z.string().min(1, "제목을 입력해주세요"),
  director: z.string().optional().nullable(),
  releaseYear: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : null)),
  posterUrl: z.string().optional().nullable(),
  watchedDate: z.string().min(1, "관람일을 입력해주세요"),
  rating: z.string().transform((v) => parseInt(v, 10)),
  oneLine: z.string().optional().nullable(),
  memorable: z.string().optional().nullable(),
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

export async function createMovie(formData: FormData) {
  const data = movieSchema.parse(rawFromFormData(formData));

  const uploadedUrl = await extractCoverFile(formData);
  let posterUrl = uploadedUrl ?? data.posterUrl ?? null;
  let director = data.director || null;
  let releaseYear = data.releaseYear;

  if (data.tmdbId) {
    try {
      const detail = await getMovieDetail(data.tmdbId);
      director = director || detail.director;
      releaseYear = releaseYear || detail.releaseYear;
      if (!posterUrl) posterUrl = detail.posterUrl;
    } catch {
      // ignore enrichment failure; user-provided data is enough
    }
  }

  const movie = await prisma.movie.create({
    data: {
      tmdbId: data.tmdbId,
      title: data.title,
      director,
      releaseYear,
      posterUrl,
      watchedDate: new Date(data.watchedDate),
      rating: data.rating,
      oneLine: data.oneLine || null,
      memorable: data.memorable || null,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
    },
  });

  revalidatePath("/movies");
  revalidatePath("/");
  redirect(`/movies/${movie.id}`);
}

const movieUpdateSchema = movieSchema.extend({
  id: z.string().transform((v) => parseInt(v, 10)),
});

export async function updateMovie(formData: FormData) {
  const data = movieUpdateSchema.parse(rawFromFormData(formData));

  const uploadedUrl = await extractCoverFile(formData);
  let posterUrl = data.posterUrl || null;

  if (uploadedUrl) {
    const existing = await prisma.movie.findUnique({
      where: { id: data.id },
      select: { posterUrl: true },
    });
    if (existing?.posterUrl) await deleteUpload(existing.posterUrl);
    posterUrl = uploadedUrl;
  }

  await prisma.movie.update({
    where: { id: data.id },
    data: {
      title: data.title,
      director: data.director || null,
      releaseYear: data.releaseYear,
      posterUrl,
      watchedDate: new Date(data.watchedDate),
      rating: data.rating,
      oneLine: data.oneLine || null,
      memorable: data.memorable || null,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
    },
  });

  revalidatePath("/movies");
  revalidatePath(`/movies/${data.id}`);
  revalidatePath("/");
  redirect(`/movies/${data.id}`);
}

export async function deleteMovie(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const movie = await prisma.movie.findUnique({
    where: { id },
    select: { posterUrl: true },
  });
  if (movie?.posterUrl) await deleteUpload(movie.posterUrl);
  await prisma.movie.delete({ where: { id } });
  revalidatePath("/movies");
  revalidatePath("/");
  redirect("/movies");
}
