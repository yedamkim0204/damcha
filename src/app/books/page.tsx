import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { formatDate, parseTags } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    orderBy: { finishedDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title={`책 ${books.length > 0 ? `(${books.length})` : ""}`}
        action={
          <LinkButton href="/books/new">
            <Plus size={16} />
            기록 추가
          </LinkButton>
        }
      />

      {books.length === 0 ? (
        <EmptyState
          message="아직 기록한 책이 없어요."
          action={
            <LinkButton href="/books/new">
              <Plus size={16} />첫 기록 만들기
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/books/${b.id}`}
              className="group rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
            >
              <div className="aspect-[2/3] bg-[var(--muted-bg)] relative">
                {b.coverUrl ? (
                  <Image
                    src={b.coverUrl}
                    alt={b.title}
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
                  {b.title}
                </h3>
                {b.author && (
                  <p className="text-xs text-[var(--muted)] line-clamp-1">
                    {b.author}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <StarDisplay value={b.rating} size={12} />
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(b.finishedDate)}
                  </span>
                </div>
                <TagPills tags={parseTags(b.tags)} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
