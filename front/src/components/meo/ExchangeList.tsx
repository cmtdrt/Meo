import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ExchangeView, HttpMethod, SortField, SortDirection, TimeRange, timeRangeToMs } from "@/types/exchange";
import { MethodBadge } from "./MethodBadge";
import { StatusBadge } from "./StatusBadge";
import { formatTimestamp } from "@/lib/exchange-utils";
import { cn } from "@/lib/utils";
import { Play, RefreshCw } from "lucide-react";

interface ExchangeListProps {
  exchanges: ExchangeView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReplay: (id: string) => void;
  replayingId: string | null;
  searchQuery: string;
  methodFilter: HttpMethod[];
  timeRange: TimeRange;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function ExchangeList({
  exchanges,
  selectedId,
  onSelect,
  onReplay,
  replayingId,
  searchQuery,
  methodFilter,
  timeRange,
  sortField,
  sortDirection,
}: ExchangeListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let items = [...exchanges];

    const ms = timeRangeToMs(timeRange);
    if (ms !== null) {
      const cutoff = Date.now() - ms;
      items = items.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
    }

    if (methodFilter.length > 0) {
      items = items.filter((e) => methodFilter.includes(e.method.toUpperCase() as HttpMethod));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((e) => e.path.toLowerCase().includes(q) || e.url.toLowerCase().includes(q));
    }

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "timestamp") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortField === "latency") cmp = a.latency - b.latency;
      else if (sortField === "status") cmp = a.status - b.status;
      return sortDirection === "desc" ? -cmp : cmp;
    });

    return items;
  }, [exchanges, searchQuery, methodFilter, timeRange, sortField, sortDirection]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 20,
  });

  return (
    <div ref={parentRef} className="flex-1 overflow-auto scrollbar-thin">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No exchanges found</p>
          <p className="text-xs mt-1">Waiting for traffic…</p>
        </div>
      ) : (
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const ex = filtered[vItem.index];
            const isSelected = ex.id === selectedId;
            const isThisReplaying = replayingId === ex.id;
            return (
              <div
                key={ex.id}
                ref={virtualizer.measureElement}
                data-index={vItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vItem.start}px)`,
                }}
                onClick={() => onSelect(ex.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-border transition-colors duration-100 group",
                  isSelected
                    ? "bg-timeline-selected"
                    : "hover:bg-timeline-hover"
                )}
              >
                <span className="text-[11px] text-muted-foreground font-mono w-[60px] shrink-0">
                  {formatTimestamp(ex.timestamp)}
                </span>
                <MethodBadge method={ex.method} />
                <span className="text-sm font-mono truncate flex-1 text-foreground">
                  {ex.path}
                </span>
                {ex.replayed && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium shrink-0">
                    <RefreshCw className="h-2.5 w-2.5" /> Replayed
                  </span>
                )}
                <StatusBadge status={ex.status} />
                <span className="text-[11px] text-muted-foreground font-mono w-[50px] text-right shrink-0">
                  {ex.latency}ms
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplay(ex.id);
                  }}
                  disabled={isThisReplaying}
                  className="shrink-0 h-7 w-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors duration-100 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                  title="Replay request"
                >
                  {isThisReplaying ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
