import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Card, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { DeleteButton } from "@/components/delete-button";
import { formatDate, parseTags } from "@/lib/utils";
import { deleteBook } from "../actions";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (Number.isNaN(bookId)) notFound();

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) notFound();

  return (
    <div>
      <PageHeader
        title={book.title}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/books/${book.id}/edit`} variant="secondary">
              <Pencil size={14} />
              수정
            </LinkButton>
            <DeleteButton action={deleteBook} id={book.id} />
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-6">
        {book.coverUrl && (
          <div className="relative w-48 aspect-[2/3] rounded-lg overflow-hidden bg-[var(--muted-bg)] flex-shrink-0">
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <StarDisplay value={book.rating} size={20} />
              <span className="text-sm text-[var(--muted)]">
                {formatDate(book.finishedDate)} 완독
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {book.author && (
                <div>
                  <span className="text-[var(--muted)]">저자</span>{" "}
                  <span>{book.author}</span>
                </div>
              )}
              {book.publisher && (
                <div>
                  <span className="text-[var(--muted)]">출판사</span>{" "}
                  <span>{book.publisher}</span>
                </div>
              )}
            </div>
            <TagPills tags={parseTags(book.tags)} />
          </Card>

          {book.review && (
            <Card>
              <h2 className="text-sm font-medium mb-2 text-[var(--muted)]">
                감상평
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {book.review}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
