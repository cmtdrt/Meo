import { useCallback, useEffect, useRef, useState } from "react";
import { Exchange, ExchangeView, exchangeToView } from "@/types/exchange";
import { fetchExchanges, createSSEConnection, deleteExchange, replayExchange } from "@/lib/api";

export function useExchanges() {
  const [exchanges, setExchanges] = useState<ExchangeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const replayMapRef = useRef<Map<string, string>>(new Map());
  const pendingReplayRef = useRef<string | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;

    async function init() {
      try {
        const data = await fetchExchanges();
        setExchanges(data.map((ex) => exchangeToView(ex)));
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load exchanges");
        setLoading(false);
      }

      es = createSSEConnection((ex: Exchange) => {
        const view = exchangeToView(ex);
        // Check if this is a replay response
        if (pendingReplayRef.current) {
          view.replayed = true;
          view.replayOfId = pendingReplayRef.current;
          replayMapRef.current.set(pendingReplayRef.current, ex.id);
          pendingReplayRef.current = null;
        }
        setExchanges((prev) => [view, ...prev]);
      });
    }

    init();
    return () => es?.close();
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteExchange(id);
    setExchanges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const replay = useCallback(async (id: string) => {
    pendingReplayRef.current = id;
    await replayExchange(id);
  }, []);

  const getReplayId = useCallback((originalId: string) => {
    return replayMapRef.current.get(originalId) || null;
  }, []);

  return { exchanges, loading, error, remove, replay, getReplayId };
}
