import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ExhibitionForm } from "../../exhibition-form";

export default async function EditExhibitionPage({
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

  return (
    <div>
      <PageHeader title="전시 기록 수정" />
      <ExhibitionForm exhibition={exhibition} />
    </div>
  );
}
