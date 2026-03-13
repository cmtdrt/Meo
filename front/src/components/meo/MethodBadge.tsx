import { cn } from "@/lib/utils";

interface MethodBadgeProps {
  method: string;
  className?: string;
}

const methodStyles: Record<string, string> = {
  GET: "bg-method-get/15 text-method-get",
  POST: "bg-method-post/15 text-method-post",
  PUT: "bg-method-put/15 text-method-put",
  PATCH: "bg-method-patch/15 text-method-patch",
  DELETE: "bg-method-delete/15 text-method-delete",
};

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const m = method.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-semibold font-mono tracking-wide min-w-[52px]",
        methodStyles[m] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {m}
    </span>
  );
}
