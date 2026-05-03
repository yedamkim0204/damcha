import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`지원하지 않는 파일 형식: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error("파일이 너무 큽니다 (최대 8MB)");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const filename = `${randomUUID()}.${safeExt}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filename = url.replace("/uploads/", "");
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return;
  }
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // file already gone, ignore
  }
}
