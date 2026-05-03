import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Card, TagPills } from "@/components/ui";
import { StarDisplay } from "@/components/star-rating";
import { DeleteButton } from "@/components/delete-button";
import { formatDate, parseTags, parsePhotos } from "@/lib/utils";
import { deleteExhibition } from "../actions";

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exhId = parseInt(id, 10);
  if (Number.isNaN(exhId)) notFound();

  const exhibition = await prisma.exhibition.findUnique({
    where: { id: exhId },
  });
  if (!exhibition) notFound();

  const photos = parsePhotos(exhibition.photos);

  return (
    <div>
      <PageHeader
        title={exhibition.title}
        action={
          <div className="flex gap-2">
            <LinkButton
              href={`/exhibitions/${exhibition.id}/edit`}
              variant="secondary"
            >
              <Pencil size={14} />
              수정
            </LinkButton>
            <DeleteButton action={deleteExhibition} id={exhibition.id} />
          </div>
        }
      />

      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <StarDisplay value={exhibition.rating} size={20} />
            <span className="text-sm text-[var(--muted)]">
              {formatDate(exhibition.visitDate)} 관람
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {exhibition.venue && (
              <div>
                <span className="text-[var(--muted)]">장소</span>{" "}
                <span>{exhibition.venue}</span>
              </div>
            )}
            {exhibition.artist && (
              <div>
                <span className="text-[var(--muted)]">작가</span>{" "}
                <span>{exhibition.artist}</span>
              </div>
            )}
          </div>
          <TagPills tags={parseTags(exhibition.tags)} />
        </Card>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((url) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden bg-[var(--muted-bg)]"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {exhibition.review && (
          <Card>
            <h2 className="text-sm font-medium mb-2 text-[var(--muted)]">
              감상평
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {exhibition.review}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
