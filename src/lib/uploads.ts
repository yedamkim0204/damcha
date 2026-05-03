import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

function safeFilename(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  return `${randomUUID()}.${safeExt}`;
}

export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`지원하지 않는 파일 형식: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error("파일이 너무 큽니다 (최대 8MB)");
  }

  const filename = safeFilename(file);

  if (useBlob) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function deleteUpload(url: string): Promise<void> {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (useBlob && url.includes(".blob.vercel-storage.com")) {
      try {
        await del(url);
      } catch {
        // already gone or no permission, ignore
      }
    }
    return;
  }
  if (!url.startsWith("/uploads/")) return;
  const filename = url.replace("/uploads/", "");
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return;
  }
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // file already gone, ignore
  }
}
