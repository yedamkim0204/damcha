const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1";

export type GoogleBook = {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  coverUrl: string | null;
  description: string | null;
};

type Volume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    description?: string;
  };
};

function pickIsbn(
  identifiers?: Array<{ type: string; identifier: string }>
): string | null {
  if (!identifiers) return null;
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10");
  return isbn10?.identifier ?? null;
}

function normalizeCover(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:/, "https:");
}

function toBook(v: Volume): GoogleBook {
  const info = v.volumeInfo ?? {};
  return {
    id: v.id,
    title: info.title ?? "(제목 없음)",
    author: info.authors?.join(", ") ?? null,
    publisher: info.publisher ?? null,
    isbn: pickIsbn(info.industryIdentifiers),
    coverUrl:
      normalizeCover(info.imageLinks?.thumbnail) ??
      normalizeCover(info.imageLinks?.smallThumbnail),
    description: info.description ?? null,
  };
}

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) return [];
  const url = new URL(`${GOOGLE_BOOKS_BASE}/volumes`);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("printType", "books");
  url.searchParams.set("langRestrict", "ko");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map(toBook);
}

export async function getBookDetail(googleId: string): Promise<GoogleBook> {
  const res = await fetch(`${GOOGLE_BOOKS_BASE}/volumes/${googleId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Books detail failed: ${res.status}`);
  const data = await res.json();
  return toBook(data);
}
