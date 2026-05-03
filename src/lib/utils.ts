import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTags(tagsField: string): string[] {
  if (!tagsField) return [];
  return tagsField
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function serializeTags(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

export function parsePhotos(photosField: string): string[] {
  if (!photosField) return [];
  return photosField.split("|").filter(Boolean);
}

export function serializePhotos(photos: string[]): string {
  return photos.filter(Boolean).join("|");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
