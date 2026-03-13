import { HeadersMap } from "@/types/exchange";

interface HeadersViewProps {
  headers: HeadersMap;
}

export function HeadersView({ headers }: HeadersViewProps) {
  const entries = Object.entries(headers);
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No headers</p>;
  }
  return (
    <div className="space-y-0.5">
      {entries.map(([key, values]) => (
        <div key={key} className="flex gap-2 text-xs font-mono">
          <span className="text-muted-foreground shrink-0">{key}:</span>
          <span className="text-foreground break-all">{values.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}
