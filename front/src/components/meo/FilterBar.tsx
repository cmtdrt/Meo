import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HttpMethod, TimeRange, TIME_RANGE_LABELS, SortField, SortDirection } from "@/types/exchange";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  methodFilter: HttpMethod[];
  onMethodFilterChange: (methods: HttpMethod[]) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, dir: SortDirection) => void;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function FilterBar({
  searchQuery,
  onSearchChange,
  timeRange,
  onTimeRangeChange,
  methodFilter,
  onMethodFilterChange,
  sortField,
  sortDirection,
  onSortChange,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleMethod = (m: HttpMethod) => {
    if (methodFilter.includes(m)) {
      onMethodFilterChange(methodFilter.filter((x) => x !== m));
    } else {
      onMethodFilterChange([...methodFilter, m]);
    }
  };

  const methodBtnStyle = (m: HttpMethod) => {
    const active = methodFilter.includes(m);
    const colors: Record<HttpMethod, string> = {
      GET: active ? "bg-method-get/15 text-method-get border-method-get/30" : "",
      POST: active ? "bg-method-post/15 text-method-post border-method-post/30" : "",
      PUT: active ? "bg-method-put/15 text-method-put border-method-put/30" : "",
      PATCH: active ? "bg-method-patch/15 text-method-patch border-method-patch/30" : "",
      DELETE: active ? "bg-method-delete/15 text-method-delete border-method-delete/30" : "",
    };
    return `px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer transition-colors duration-100 ${
      active ? colors[m] : "border-border text-muted-foreground hover:bg-secondary"
    }`;
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by path or URL…"
            className="pl-7 h-7 text-xs bg-secondary border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
          <SelectTrigger className="h-7 w-[140px] text-xs border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIME_RANGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors duration-100"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {showAdvanced && (
        <div className="px-3 pb-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-1">Method:</span>
            {METHODS.map((m) => (
              <button key={m} onClick={() => toggleMethod(m)} className={methodBtnStyle(m)}>
                {m}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-1">Sort:</span>
            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(v) => {
                const [f, d] = v.split("-") as [SortField, SortDirection];
                onSortChange(f, d);
              }}
            >
              <SelectTrigger className="h-6 text-[11px] border-border w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp-desc" className="text-xs">Newest first</SelectItem>
                <SelectItem value="timestamp-asc" className="text-xs">Oldest first</SelectItem>
                <SelectItem value="latency-desc" className="text-xs">Slowest first</SelectItem>
                <SelectItem value="latency-asc" className="text-xs">Fastest first</SelectItem>
                <SelectItem value="status-asc" className="text-xs">Status ↑</SelectItem>
                <SelectItem value="status-desc" className="text-xs">Status ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
