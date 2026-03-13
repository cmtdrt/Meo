import { cn } from "@/lib/utils";
import { getStatusColor, getStatusBgColor } from "@/lib/exchange-utils";

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold font-mono",
        getStatusColor(status),
        getStatusBgColor(status),
        className
      )}
    >
      {status}
    </span>
  );
}
