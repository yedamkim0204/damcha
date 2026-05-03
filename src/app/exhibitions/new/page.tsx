import { PageHeader } from "@/components/ui";
import { ExhibitionForm } from "../exhibition-form";

export default function NewExhibitionPage() {
  return (
    <div>
      <PageHeader title="전시 기록 추가" />
      <ExhibitionForm />
    </div>
  );
}
