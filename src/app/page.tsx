import Link from "next/link";
import Image from "next/image";
import { Film, BookOpen, Palette } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui";
import { parsePhotos } from "@/lib/utils";

export const dynamic = "force-dynamic";

type GalleryItem = {
  key: string;
  href: string;
  title: string;
  imageUrl: string | null;
  rating: number;
};

async function getAllItems(): Promise<GalleryItem[]> {
  const [movies, books, exhibitions] = await Promise.all([
    prisma.movie.findMany(),
    prisma.book.findMany(),
    prisma.exhibition.findMany(),
  ]);

  const items: GalleryItem[] = [
    ...movies.map((m) => ({
      key: `m-${m.id}`,
      href: `/movies/${m.id}`,
      title: m.title,
      imageUrl: m.posterUrl,
      rating: m.rating,
    })),
    ...books.map((b) => ({
      key: `b-${b.id}`,
      href: `/books/${b.id}`,
      title: b.title,
      imageUrl: b.coverUrl,
      rating: b.rating,
    })),
    ...exhibitions.map((e) => ({
      key: `e-${e.id}`,
      href: `/exhibitions/${e.id}`,
      title: e.title,
      imageUrl: parsePhotos(e.photos)[0] ?? null,
      rating: e.rating,
    })),
  ];

  return items.sort((a, b) => b.rating - a.rating);
}

function gridCols(count: number): number {
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 4;
  if (count <= 9) return 6;
  if (count <= 16) return 8;
  if (count <= 36) return 10;
  return 12;
}

function ratingSpan(rating: number, cols: number): number {
  if (cols <= 1) return 1;
  const max = Math.max(1, Math.floor(cols / 2));
  if (rating >= 5) return max;
  if (rating === 4) return Math.max(1, Math.ceil(max * 0.66));
  if (rating === 3) return Math.max(1, Math.ceil(max * 0.5));
  return 1;
}

export default async function GalleryPage() {
  const items = await getAllItems();
  const count = items.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1
          className="text-6xl font-black tracking-tight mb-3 text-[var(--accent)]"
          style={{
            letterSpacing: "-0.05em",
            fontFamily: "var(--font-pretendard), sans-serif",
          }}
        >
          DAMCHA
        </h1>
        <p className="text-[var(--muted)] mb-8">
          기록을 시작해보세요.
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <LinkButton href="/movies/new" variant="primary">
            <Film size={16} /> 영화
          </LinkButton>
          <LinkButton href="/books/new" variant="primary">
            <BookOpen size={16} /> 책
          </LinkButton>
          <LinkButton href="/exhibitions/new" variant="primary">
            <Palette size={16} /> 전시
          </LinkButton>
        </div>
      </div>
    );
  }

  const cols = gridCols(count);

  return (
    <div
      className="grid gap-1 -my-8"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoFlow: "dense",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        width: "100vw",
      }}
    >
      {items.map((item) => {
        const span = ratingSpan(item.rating, cols);
        return (
          <Link
            key={item.key}
            href={item.href}
            className="relative bg-[var(--muted-bg)] overflow-hidden group aspect-square"
            style={{
              gridColumn: `span ${span}`,
              gridRow: `span ${span}`,
            }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes={`${Math.ceil((100 * span) / cols)}vw`}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-sm p-2 text-center">
                {item.title}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium line-clamp-2">
                {item.title}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
