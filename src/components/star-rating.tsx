"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  defaultValue?: number;
  size?: number;
  readOnly?: boolean;
};

export function StarRating({ name, defaultValue = 0, size = 24, readOnly }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);

  const display = hover ?? value;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => !readOnly && setValue(n)}
          className={cn(
            "transition-colors",
            !readOnly && "hover:scale-110 cursor-pointer"
          )}
          aria-label={`${n}점`}
        >
          <Star
            size={size}
            className={cn(
              n <= display
                ? "fill-amber-400 text-amber-400"
                : "text-[var(--border)]"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--border)]"
          )}
        />
      ))}
    </div>
  );
}
