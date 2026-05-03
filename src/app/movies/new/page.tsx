import { PageHeader } from "@/components/ui";
import { MovieForm } from "../movie-form";

export default function NewMoviePage() {
  return (
    <div>
      <PageHeader title="영화 기록 추가" />
      <MovieForm />
    </div>
  );
}
