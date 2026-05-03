"use client";

import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { serializeTags } from "@/lib/utils";

type Props = {
  name: string;
  defaultTags?: string[];
};

export function TagInput({ name, defaultTags = [] }: Props) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (tags.includes(v)) return;
    setTags([...tags, v]);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={serializeTags(tags)} />
      <div className="flex flex-wrap gap-1.5 p-2 border border-[var(--border)] rounded-md bg-[var(--card)] min-h-[42px] focus-within:border-[var(--accent)]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 bg-[var(--muted-bg)] text-sm px-2 py-0.5 rounded"
          >
            {t}
            <button
              type="button"
              onClick={() => setTags(tags.filter((x) => x !== t))}
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label={`${t} 제거`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? "엔터로 태그 추가" : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
    </div>
  );
}
