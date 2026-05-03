import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "md" && "px-4 py-2 text-sm",
        size === "sm" && "px-3 py-1 text-sm",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:opacity-90",
        variant === "secondary" &&
          "bg-[var(--muted-bg)] text-[var(--foreground)] hover:opacity-80 border border-[var(--border)]",
        variant === "ghost" &&
          "text-[var(--muted)] hover:text-[var(--foreground)]",
        variant === "danger" &&
          "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20",
        className
      )}
    />
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors",
        size === "md" && "px-4 py-2 text-sm",
        size === "sm" && "px-3 py-1 text-sm",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:opacity-90",
        variant === "secondary" &&
          "bg-[var(--muted-bg)] text-[var(--foreground)] hover:opacity-80 border border-[var(--border)]",
        variant === "ghost" &&
          "text-[var(--muted)] hover:text-[var(--foreground)]",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:border-[var(--accent)]",
        className
      )}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:border-[var(--accent)] resize-y min-h-[120px]",
        className
      )}
    />
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium mb-1.5 text-[var(--foreground)]",
        className
      )}
    >
      {children}
    </label>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-[var(--border)] rounded-lg p-12 text-center">
      <p className="text-[var(--muted)] mb-4">{message}</p>
      {action}
    </div>
  );
}

export function TagPills({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="text-xs bg-[var(--muted-bg)] text-[var(--muted)] px-2 py-0.5 rounded"
        >
          #{t}
        </span>
      ))}
    </div>
  );
}
