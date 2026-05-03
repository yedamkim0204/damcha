const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export type TmdbMovie = {
  id: number;
  title: string;
  originalTitle: string;
  releaseYear: number | null;
  posterUrl: string | null;
  overview: string;
};

export type TmdbDetail = TmdbMovie & {
  director: string | null;
};

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY is not set. Add it to .env.local — get a key at https://www.themoviedb.org/settings/api"
    );
  }
  return key;
}

function getYear(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const y = parseInt(dateStr.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

function getPoster(path: string | null | undefined): string | null {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  if (!query.trim()) return [];
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("query", query);
  url.searchParams.set("language", "ko-KR");
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).slice(0, 20).map(
    (m: {
      id: number;
      title: string;
      original_title: string;
      release_date: string;
      poster_path: string | null;
      overview: string;
    }) => ({
      id: m.id,
      title: m.title,
      originalTitle: m.original_title,
      releaseYear: getYear(m.release_date),
      posterUrl: getPoster(m.poster_path),
      overview: m.overview,
    })
  );
}

export async function getMovieDetail(tmdbId: number): Promise<TmdbDetail> {
  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "ko-KR");
  url.searchParams.set("append_to_response", "credits");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB detail failed: ${res.status}`);
  const m = await res.json();

  const director =
    m.credits?.crew?.find(
      (c: { job: string; name: string }) => c.job === "Director"
    )?.name ?? null;

  return {
    id: m.id,
    title: m.title,
    originalTitle: m.original_title,
    releaseYear: getYear(m.release_date),
    posterUrl: getPoster(m.poster_path),
    overview: m.overview,
    director,
  };
}
