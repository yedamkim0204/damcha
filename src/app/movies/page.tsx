import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { formatDate, parseTags } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await prisma.movie.findMany({
    orderBy: { watchedDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title={`영화 ${movies.length > 0 ? `(${movies.length})` : ""}`}
        action={
          <LinkButton href="/movies/new">
            <Plus size={16} />
            기록 추가
          </LinkButton>
        }
      />

      {movies.length === 0 ? (
        <EmptyState
          message="아직 기록한 영화가 없어요."
          action={
            <LinkButton href="/movies/new">
              <Plus size={16} />첫 기록 만들기
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map((m) => (
            <Link
              key={m.id}
              href={`/movies/${m.id}`}
              className="group rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
            >
              <div className="aspect-[2/3] bg-[var(--muted-bg)] relative">
                {m.posterUrl ? (
                  <Image
                    src={m.posterUrl}
                    alt={m.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-sm">
                    표지 없음
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <h3
                  className="text-base line-clamp-2 group-hover:text-[var(--accent)]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {m.title}
                </h3>
                <div className="flex items-center justify-between">
                  <StarDisplay value={m.rating} size={12} />
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(m.watchedDate)}
                  </span>
                </div>
                <TagPills tags={parseTags(m.tags)} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
