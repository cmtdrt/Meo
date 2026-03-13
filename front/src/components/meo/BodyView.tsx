import { useState } from "react";
import { tryFormatJson } from "@/lib/exchange-utils";
import { cn } from "@/lib/utils";

interface BodyViewProps {
  body: string;
  className?: string;
}

export function BodyView({ body, className }: BodyViewProps) {
  const [raw, setRaw] = useState(false);
  const { formatted, isJson } = tryFormatJson(body);

  if (!body) {
    return <p className="text-xs text-muted-foreground italic">No body</p>;
  }

  return (
    <div className={cn("relative", className)}>
      {isJson && (
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setRaw(false)}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium transition-colors duration-100",
              !raw ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            Pretty
          </button>
          <button
            onClick={() => setRaw(true)}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium transition-colors duration-100",
              raw ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            Raw
          </button>
        </div>
      )}
      <pre className="text-xs font-mono bg-secondary rounded p-3 overflow-auto max-h-[400px] scrollbar-thin whitespace-pre-wrap break-all text-foreground">
        {raw ? body : formatted}
      </pre>
    </div>
  );
}
