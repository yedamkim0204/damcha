import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { BookForm } from "../../book-form";

export default async function EditBookPage({
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
      <PageHeader title="책 기록 수정" />
      <BookForm book={book} />
    </div>
  );
}
