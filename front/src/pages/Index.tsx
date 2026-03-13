import { useState, useCallback } from "react";
import { useExchanges } from "@/hooks/use-exchanges";
import { HttpMethod, SortField, SortDirection, TimeRange } from "@/types/exchange";
import { Navbar } from "@/components/meo/Navbar";
import { FilterBar } from "@/components/meo/FilterBar";
import { ExchangeList } from "@/components/meo/ExchangeList";
import { ExchangeDetail } from "@/components/meo/ExchangeDetail";

const Index = () => {
  const { exchanges, loading, error, remove, replay, getReplayId } = useExchanges();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [methodFilter, setMethodFilter] = useState<HttpMethod[]>([]);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const selectedExchange = exchanges.find((e) => e.id === selectedId) || null;

  const replayExchange = selectedId
    ? (() => {
        const replayId = getReplayId(selectedId);
        return replayId ? exchanges.find((e) => e.id === replayId) || null : null;
      })()
    : null;

  const handleReplay = useCallback(async (id: string) => {
    setReplayingId(id);
    try {
      await replay(id);
    } catch {
      // handled
    } finally {
      setReplayingId(null);
    }
  }, [replay]);

  const handleDelete = useCallback(async (id: string) => {
    await remove(id);
    if (selectedId === id) setSelectedId(null);
  }, [remove, selectedId]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar exchangeCount={exchanges.length} />

      <div className="flex flex-col flex-1 min-h-0">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          methodFilter={methodFilter}
          onMethodFilterChange={setMethodFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(f, d) => { setSortField(f); setSortDirection(d); }}
        />

        {loading ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 text-destructive text-sm px-4 text-center">
            {error}
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Exchange list */}
            <ExchangeList
              exchanges={exchanges}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onReplay={handleReplay}
              replayingId={replayingId}
              searchQuery={searchQuery}
              methodFilter={methodFilter}
              timeRange={timeRange}
              sortField={sortField}
              sortDirection={sortDirection}
            />

            {/* Detail panel slides up from bottom when selected */}
            {selectedExchange && (
              <div className="shrink-0 border-t border-border">
                <ExchangeDetail
                  exchange={selectedExchange}
                  onReplay={handleReplay}
                  onDelete={handleDelete}
                  onClose={() => setSelectedId(null)}
                  replayExchange={replayExchange}
                  isReplaying={replayingId === selectedExchange.id}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
