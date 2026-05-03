"use client";

import { Button } from "./ui";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: number | string;
  message?: string;
};

export function DeleteButton({ action, id, message = "정말 삭제할까요?" }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="danger"
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault();
        }}
      >
        삭제
      </Button>
    </form>
  );
}
