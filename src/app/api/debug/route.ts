import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const token = process.env.DATABASE_AUTH_TOKEN ?? "";
  const tmdb = process.env.TMDB_API_KEY ?? "";
  const blob = process.env.BLOB_READ_WRITE_TOKEN ?? "";

  return NextResponse.json({
    DATABASE_URL_prefix: url.slice(0, 50),
    DATABASE_URL_isLibsql: url.startsWith("libsql://"),
    DATABASE_AUTH_TOKEN_length: token.length,
    DATABASE_AUTH_TOKEN_starts: token.slice(0, 10),
    TMDB_API_KEY_length: tmdb.length,
    BLOB_READ_WRITE_TOKEN_set: blob.length > 0,
    NODE_ENV: process.env.NODE_ENV,
  });
}
