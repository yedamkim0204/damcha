"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Input, Button } from "./ui";

export type SearchResult = {
  externalId: string;
  title: string;
  subtitle?: string | null;
  posterUrl: string | null;
};

type Props = {
  searchAction: (query: string) => Promise<SearchResult[]>;
  onSelect: (item: SearchResult) => void;
  placeholder: string;
  selectedId?: string;
};

export function SearchPicker({
  searchAction,
  onSelect,
  placeholder,
  selectedId,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const list = await searchAction(query);
        setResults(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "검색 실패");
      }
    });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <Button type="submit" disabled={pending || !query.trim()}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          검색
        </Button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-500/10 p-2 rounded">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.externalId}
              type="button"
              onClick={() => onSelect(r)}
              className={`text-left border rounded-md overflow-hidden hover:border-[var(--accent)] transition-colors ${
                selectedId === r.externalId
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="aspect-[2/3] bg-[var(--muted-bg)] relative">
                {r.posterUrl ? (
                  <Image
                    src={r.posterUrl}
                    alt={r.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-xs">
                    표지 없음
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                {r.subtitle && (
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
                    {r.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
