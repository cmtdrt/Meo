import { ExchangeView } from "@/types/exchange";

export function getMethodColor(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case "GET": return "bg-method-get";
    case "POST": return "bg-method-post";
    case "PUT": return "bg-method-put";
    case "PATCH": return "bg-method-patch";
    case "DELETE": return "bg-method-delete";
    default: return "bg-muted-foreground";
  }
}

export function getMethodTextColor(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case "GET": return "text-method-get";
    case "POST": return "text-method-post";
    case "PUT": return "text-method-put";
    case "PATCH": return "text-method-patch";
    case "DELETE": return "text-method-delete";
    default: return "text-muted-foreground";
  }
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-status-2xx";
  if (status >= 300 && status < 400) return "text-status-3xx";
  if (status >= 400 && status < 500) return "text-status-4xx";
  if (status >= 500) return "text-status-5xx";
  return "text-muted-foreground";
}

export function getStatusBgColor(status: number): string {
  if (status >= 200 && status < 300) return "bg-status-2xx/10";
  if (status >= 300 && status < 400) return "bg-status-3xx/10";
  if (status >= 400 && status < 500) return "bg-status-4xx/10";
  if (status >= 500) return "bg-status-5xx/10";
  return "bg-muted";
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatRelativeTime(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = now - then;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function generateCurl(ex: ExchangeView): string {
  let cmd = `curl -X ${ex.method} '${ex.url}'`;
  if (ex.requestHeaders) {
    for (const [key, values] of Object.entries(ex.requestHeaders)) {
      for (const v of values) {
        cmd += ` \\\n  -H '${key}: ${v}'`;
      }
    }
  }
  if (ex.requestBody) {
    cmd += ` \\\n  -d '${ex.requestBody}'`;
  }
  return cmd;
}

export function tryFormatJson(str: string): { formatted: string; isJson: boolean } {
  if (!str) return { formatted: "", isJson: false };
  try {
    const parsed = JSON.parse(str);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: str, isJson: false };
  }
}
