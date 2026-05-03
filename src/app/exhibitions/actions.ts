"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializePhotos, parsePhotos, serializeTags } from "@/lib/utils";
import { saveUpload, deleteUpload } from "@/lib/uploads";

const exhibitionSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  venue: z.string().optional().nullable(),
  artist: z.string().optional().nullable(),
  visitDate: z.string().min(1, "관람일을 입력해주세요"),
  rating: z.string().transform((v) => parseInt(v, 10)),
  review: z.string().optional().nullable(),
  tags: z.string().optional().default(""),
});

async function extractPhotoUrls(formData: FormData): Promise<string[]> {
  const files = formData.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await saveUpload(file));
  }
  return urls;
}

export async function createExhibition(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = exhibitionSchema.parse({
    title: raw.title,
    venue: raw.venue,
    artist: raw.artist,
    visitDate: raw.visitDate,
    rating: raw.rating,
    review: raw.review,
    tags: raw.tags,
  });

  const photoUrls = await extractPhotoUrls(formData);

  const exhibition = await prisma.exhibition.create({
    data: {
      title: data.title,
      venue: data.venue || null,
      artist: data.artist || null,
      visitDate: new Date(data.visitDate),
      rating: data.rating,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
      photos: serializePhotos(photoUrls),
    },
  });

  revalidatePath("/exhibitions");
  revalidatePath("/");
  redirect(`/exhibitions/${exhibition.id}`);
}

const exhibitionUpdateSchema = exhibitionSchema.extend({
  id: z.string().transform((v) => parseInt(v, 10)),
  existingPhotos: z.string().optional().default(""),
});

export async function updateExhibition(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = exhibitionUpdateSchema.parse({
    id: raw.id,
    title: raw.title,
    venue: raw.venue,
    artist: raw.artist,
    visitDate: raw.visitDate,
    rating: raw.rating,
    review: raw.review,
    tags: raw.tags,
    existingPhotos: raw.existingPhotos,
  });

  const existing = parsePhotos(data.existingPhotos);

  const current = await prisma.exhibition.findUnique({
    where: { id: data.id },
    select: { photos: true },
  });
  const previous = parsePhotos(current?.photos ?? "");
  const removed = previous.filter((p) => !existing.includes(p));
  await Promise.all(removed.map(deleteUpload));

  const newUrls = await extractPhotoUrls(formData);
  const photos = [...existing, ...newUrls];

  await prisma.exhibition.update({
    where: { id: data.id },
    data: {
      title: data.title,
      venue: data.venue || null,
      artist: data.artist || null,
      visitDate: new Date(data.visitDate),
      rating: data.rating,
      review: data.review || null,
      tags: serializeTags(
        (data.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      ),
      photos: serializePhotos(photos),
    },
  });

  revalidatePath("/exhibitions");
  revalidatePath(`/exhibitions/${data.id}`);
  revalidatePath("/");
  redirect(`/exhibitions/${data.id}`);
}

export async function deleteExhibition(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const exhibition = await prisma.exhibition.findUnique({
    where: { id },
    select: { photos: true },
  });
  if (exhibition) {
    await Promise.all(parsePhotos(exhibition.photos).map(deleteUpload));
  }
  await prisma.exhibition.delete({ where: { id } });
  revalidatePath("/exhibitions");
  revalidatePath("/");
  redirect("/exhibitions");
}
