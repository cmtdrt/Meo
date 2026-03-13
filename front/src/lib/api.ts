import { Exchange } from "@/types/exchange";

const API_BASE = import.meta.env.VITE_MEO_API_URL || "http://localhost:8081";

export async function fetchExchanges(): Promise<Exchange[]> {
  const res = await fetch(`${API_BASE}/exchanges`);
  if (!res.ok) throw new Error(`Failed to fetch exchanges: ${res.status}`);
  return res.json();
}

export async function fetchExchangeDetail(id: string): Promise<Exchange> {
  const res = await fetch(`${API_BASE}/exchanges/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch exchange ${id}: ${res.status}`);
  return res.json();
}

export async function deleteExchange(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/exchanges/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete exchange ${id}: ${res.status}`);
}

export async function replayExchange(id: string): Promise<Response> {
  const res = await fetch(`${API_BASE}/exchanges/${id}/replay`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to replay exchange ${id}: ${res.status}`);
  return res;
}

export function createSSEConnection(onExchange: (ex: Exchange) => void): EventSource {
  const es = new EventSource(`${API_BASE}/events`);
  es.onmessage = (event) => {
    try {
      const exchange: Exchange = JSON.parse(event.data);
      onExchange(exchange);
    } catch (e) {
      console.error("Failed to parse SSE event:", e);
    }
  };
  return es;
}
