import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Card, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { DeleteButton } from "@/components/delete-button";
import { formatDate, parseTags } from "@/lib/utils";
import { deleteMovie } from "../actions";

export default async function MovieDetailPage({
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
      <PageHeader
        title={movie.title}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/movies/${movie.id}/edit`} variant="secondary">
              <Pencil size={14} />
              수정
            </LinkButton>
            <DeleteButton action={deleteMovie} id={movie.id} />
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-6">
        {movie.posterUrl && (
          <div className="relative w-48 aspect-[2/3] rounded-lg overflow-hidden bg-[var(--muted-bg)] flex-shrink-0">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <StarDisplay value={movie.rating} size={20} />
              <span className="text-sm text-[var(--muted)]">
                {formatDate(movie.watchedDate)} 관람
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {movie.director && (
                <div>
                  <span className="text-[var(--muted)]">감독</span>{" "}
                  <span>{movie.director}</span>
                </div>
              )}
              {movie.releaseYear && (
                <div>
                  <span className="text-[var(--muted)]">개봉</span>{" "}
                  <span>{movie.releaseYear}</span>
                </div>
              )}
            </div>
            <TagPills tags={parseTags(movie.tags)} />
          </Card>

          {movie.oneLine && (
            <Card className="border-[var(--accent)]/40">
              <p className="text-sm font-bold leading-relaxed text-[var(--foreground)]">
                {movie.oneLine}
              </p>
            </Card>
          )}

          {movie.memorable && (
            <Card>
              <h2 className="text-sm font-medium mb-3 text-[var(--muted)]">
                기억에 남는 대사 / 장면
              </h2>
              <blockquote className="border-l-2 border-[var(--accent)] pl-4 italic text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                {movie.memorable}
              </blockquote>
            </Card>
          )}

          {movie.review && (
            <Card>
              <h2 className="text-sm font-medium mb-2 text-[var(--muted)]">
                감상평
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {movie.review}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
