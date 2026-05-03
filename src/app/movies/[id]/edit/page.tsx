import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { MovieForm } from "../../movie-form";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (Number.isNaN(movieId)) notFound();

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) notFound();

  return (
    <div>
      <PageHeader title="영화 기록 수정" />
      <MovieForm movie={movie} />
    </div>
  );
}
