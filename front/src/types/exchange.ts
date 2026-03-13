export type HeadersMap = { [key: string]: string[] };

export interface RequestData {
  id: string;
  method: string;
  url: string;
  headers: HeadersMap;
  body: string;
  timestamp: string;
}

export interface ResponseData {
  statusCode: number;
  headers: HeadersMap;
  body: string;
  duration: number;
}

export interface Exchange {
  id: string;
  request: RequestData;
  response: ResponseData;
  createdAt: string;
}

export interface ExchangeView {
  id: string;
  method: string;
  url: string;
  path: string;
  status: number;
  timestamp: string;
  latency: number;
  requestHeaders: HeadersMap;
  requestBody: string;
  responseHeaders: HeadersMap;
  responseBody: string;
  replayed: boolean;
  replayOfId?: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type SortField = "timestamp" | "latency" | "status";
export type SortDirection = "asc" | "desc";

export type TimeRange = "5m" | "15m" | "30m" | "1h" | "3h" | "12h" | "24h" | "5d" | "all";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "5m": "Last 5 minutes",
  "15m": "Last 15 minutes",
  "30m": "Last 30 minutes",
  "1h": "Last 1 hour",
  "3h": "Last 3 hours",
  "12h": "Last 12 hours",
  "24h": "Last 24 hours",
  "5d": "Last 5 days",
  "all": "All time",
};

export function timeRangeToMs(range: TimeRange): number | null {
  const map: Record<TimeRange, number | null> = {
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "3h": 3 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "5d": 5 * 24 * 60 * 60 * 1000,
    "all": null,
  };
  return map[range];
}

export function exchangeToView(ex: Exchange, replayed = false, replayOfId?: string): ExchangeView {
  let path: string;
  try {
    path = new URL(ex.request.url).pathname + new URL(ex.request.url).search;
  } catch {
    path = ex.request.url;
  }
  return {
    id: ex.id,
    method: ex.request.method,
    url: ex.request.url,
    path,
    status: ex.response.statusCode,
    timestamp: ex.request.timestamp,
    latency: ex.response.duration,
    requestHeaders: ex.request.headers,
    requestBody: ex.request.body,
    responseHeaders: ex.response.headers,
    responseBody: ex.response.body,
    replayed,
    replayOfId,
  };
}
