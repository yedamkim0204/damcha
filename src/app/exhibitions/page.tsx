import Link from "next/link";
import Image from "next/image";
import { Plus, Palette } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { formatDate, parseTags, parsePhotos } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExhibitionsPage() {
  const exhibitions = await prisma.exhibition.findMany({
    orderBy: { visitDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title={`전시 ${exhibitions.length > 0 ? `(${exhibitions.length})` : ""}`}
        action={
          <LinkButton href="/exhibitions/new">
            <Plus size={16} />
            기록 추가
          </LinkButton>
        }
      />

      {exhibitions.length === 0 ? (
        <EmptyState
          message="아직 기록한 전시가 없어요."
          action={
            <LinkButton href="/exhibitions/new">
              <Plus size={16} />첫 기록 만들기
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exhibitions.map((e) => {
            const photos = parsePhotos(e.photos);
            return (
              <Link
                key={e.id}
                href={`/exhibitions/${e.id}`}
                className="group rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
              >
                <div className="aspect-video bg-[var(--muted-bg)] relative">
                  {photos[0] ? (
                    <Image
                      src={photos[0]}
                      alt={e.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)]">
                      <Palette size={32} />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <h3
                    className="text-lg line-clamp-1 group-hover:text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {e.title}
                  </h3>
                  {e.venue && (
                    <p className="text-sm text-[var(--muted)] line-clamp-1">
                      {e.venue}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <StarDisplay value={e.rating} size={14} />
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(e.visitDate)}
                    </span>
                  </div>
                  <TagPills tags={parseTags(e.tags)} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
