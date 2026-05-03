import Link from "next/link";
import Image from "next/image";
import { Film, BookOpen, Palette, Search as SearchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Input, EmptyState } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { formatDate, parseTags, parsePhotos } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let movies: Awaited<ReturnType<typeof prisma.movie.findMany>> = [];
  let books: Awaited<ReturnType<typeof prisma.book.findMany>> = [];
  let exhibitions: Awaited<ReturnType<typeof prisma.exhibition.findMany>> = [];

  if (query) {
    [movies, books, exhibitions] = await Promise.all([
      prisma.movie.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { director: { contains: query } },
            { oneLine: { contains: query } },
            { memorable: { contains: query } },
            { review: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        orderBy: { watchedDate: "desc" },
      }),
      prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { author: { contains: query } },
            { review: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        orderBy: { finishedDate: "desc" },
      }),
      prisma.exhibition.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { venue: { contains: query } },
            { artist: { contains: query } },
            { review: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        orderBy: { visitDate: "desc" },
      }),
    ]);
  }

  const total = movies.length + books.length + exhibitions.length;

  return (
    <div>
      <PageHeader title="검색" />

      <form action="/search" className="mb-6">
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <Input
            name="q"
            defaultValue={query}
            placeholder="제목, 태그, 감상평 등으로 검색"
            className="pl-10"
          />
        </div>
      </form>

      {!query ? (
        <EmptyState message="검색어를 입력해주세요. 제목, 감독/저자/장소, 태그, 감상평까지 검색해요." />
      ) : total === 0 ? (
        <EmptyState message={`"${query}"에 대한 검색 결과가 없어요.`} />
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-[var(--muted)]">
            총 <strong>{total}</strong>건 — 영화 {movies.length} · 책{" "}
            {books.length} · 전시 {exhibitions.length}
          </p>

          {movies.length > 0 && (
            <ResultGroup
              icon={<Film size={16} />}
              title={`영화 (${movies.length})`}
            >
              {movies.map((m) => (
                <ResultRow
                  key={m.id}
                  href={`/movies/${m.id}`}
                  title={m.title}
                  subtitle={[m.director, m.releaseYear].filter(Boolean).join(" · ")}
                  imageUrl={m.posterUrl}
                  rating={m.rating}
                  date={m.watchedDate}
                  tags={parseTags(m.tags)}
                />
              ))}
            </ResultGroup>
          )}

          {books.length > 0 && (
            <ResultGroup
              icon={<BookOpen size={16} />}
              title={`책 (${books.length})`}
            >
              {books.map((b) => (
                <ResultRow
                  key={b.id}
                  href={`/books/${b.id}`}
                  title={b.title}
                  subtitle={b.author ?? ""}
                  imageUrl={b.coverUrl}
                  rating={b.rating}
                  date={b.finishedDate}
                  tags={parseTags(b.tags)}
                />
              ))}
            </ResultGroup>
          )}

          {exhibitions.length > 0 && (
            <ResultGroup
              icon={<Palette size={16} />}
              title={`전시 (${exhibitions.length})`}
            >
              {exhibitions.map((e) => (
                <ResultRow
                  key={e.id}
                  href={`/exhibitions/${e.id}`}
                  title={e.title}
                  subtitle={[e.venue, e.artist].filter(Boolean).join(" · ")}
                  imageUrl={parsePhotos(e.photos)[0] ?? null}
                  rating={e.rating}
                  date={e.visitDate}
                  tags={parseTags(e.tags)}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] mb-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  imageUrl,
  rating,
  date,
  tags,
}: {
  href: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  rating: number;
  date: Date;
  tags: string[];
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 p-3 border border-[var(--border)] bg-[var(--card)] rounded-lg hover:border-[var(--accent)] transition-colors"
    >
      <div className="relative w-12 h-16 flex-shrink-0 bg-[var(--muted-bg)] rounded overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium line-clamp-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-[var(--muted)] line-clamp-1">{subtitle}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <StarDisplay value={rating} size={12} />
          <span className="text-xs text-[var(--muted)]">{formatDate(date)}</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10px] bg-[var(--muted-bg)] text-[var(--muted)] px-1.5 py-0.5 rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
