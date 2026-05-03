import { PageHeader } from "@/components/ui";
import { BookForm } from "../book-form";

export default function NewBookPage() {
  return (
    <div>
      <PageHeader title="책 기록 추가" />
      <BookForm />
    </div>
  );
}
