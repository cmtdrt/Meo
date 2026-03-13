import { useState } from "react";
import { ExchangeView } from "@/types/exchange";
import { MethodBadge } from "./MethodBadge";
import { StatusBadge } from "./StatusBadge";
import { HeadersView } from "./HeadersView";
import { BodyView } from "./BodyView";
import { generateCurl } from "@/lib/exchange-utils";
import { cn } from "@/lib/utils";
import { Copy, Play, Trash2, Terminal, Clock, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ExchangeDetailProps {
  exchange: ExchangeView;
  onReplay: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  replayExchange: ExchangeView | null;
  isReplaying: boolean;
}

type Tab = "request" | "response" | "compare";

export function ExchangeDetail({ exchange, onReplay, onDelete, onClose, replayExchange, isReplaying }: ExchangeDetailProps) {
  const [tab, setTab] = useState<Tab>("request");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
    toast.success("Copied to clipboard");
  };

  const CopyBtn = ({ text, field, label }: { text: string; field: string; label?: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-muted-foreground hover:bg-secondary transition-colors duration-100"
    >
      {copiedField === field ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label}
    </button>
  );

  const tabStyle = (t: Tab) =>
    cn(
      "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors duration-100 cursor-pointer",
      tab === t
        ? "border-b-primary text-foreground"
        : "border-b-transparent text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="border border-border rounded-lg bg-background shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-panel-header">
        <div className="flex items-center gap-2 min-w-0">
          <MethodBadge method={exchange.method} />
          <span className="text-sm font-mono truncate text-foreground">{exchange.path}</span>
          {exchange.replayed && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium shrink-0">
              <RefreshCw className="h-2.5 w-2.5" /> Replayed
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => copyToClipboard(generateCurl(exchange), "curl")}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-muted-foreground hover:bg-secondary transition-colors duration-100 border border-border"
          >
            <Terminal className="h-3 w-3" />
            {copiedField === "curl" ? "Copied!" : "cURL"}
          </button>
          <button
            onClick={() => onReplay(exchange.id)}
            disabled={isReplaying}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-100 disabled:opacity-50"
          >
            {isReplaying ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Replay
          </button>
          <button
            onClick={() => onDelete(exchange.id)}
            className="flex items-center justify-center h-7 w-7 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded text-muted-foreground hover:bg-secondary transition-colors duration-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        <button className={tabStyle("request")} onClick={() => setTab("request")}>Request</button>
        <button className={tabStyle("response")} onClick={() => setTab("response")}>Response</button>
        <button className={tabStyle("compare")} onClick={() => setTab("compare")}>
          Compare
          {replayExchange && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary inline-block" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[60vh] overflow-auto scrollbar-thin">
        {tab === "request" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">URL</span>
                <CopyBtn text={exchange.url} field="url" />
              </div>
              <p className="text-xs font-mono bg-secondary rounded px-2 py-1.5 break-all text-foreground">{exchange.url}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Headers</span>
                <CopyBtn text={JSON.stringify(exchange.requestHeaders, null, 2)} field="reqHeaders" label="Copy" />
              </div>
              <HeadersView headers={exchange.requestHeaders} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Body</span>
                {exchange.requestBody && <CopyBtn text={exchange.requestBody} field="reqBody" label="Copy" />}
              </div>
              <BodyView body={exchange.requestBody} />
            </div>
          </div>
        )}

        {tab === "response" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Status</span>
                <StatusBadge status={exchange.status} />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Latency</span>
                <span className="flex items-center gap-1 text-xs font-mono text-foreground">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {exchange.latency}ms
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Headers</span>
                <CopyBtn text={JSON.stringify(exchange.responseHeaders, null, 2)} field="resHeaders" label="Copy" />
              </div>
              <HeadersView headers={exchange.responseHeaders} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Body</span>
                {exchange.responseBody && <CopyBtn text={exchange.responseBody} field="resBody" label="Copy" />}
              </div>
              <BodyView body={exchange.responseBody} />
            </div>
          </div>
        )}

        {tab === "compare" && (
          <CompareView original={exchange} replay={replayExchange} />
        )}
      </div>
    </div>
  );
}

function CompareView({ original, replay }: { original: ExchangeView; replay: ExchangeView | null }) {
  if (!replay) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <RefreshCw className="h-6 w-6 mb-2 opacity-30" />
        <p className="text-sm">No replay available</p>
        <p className="text-xs mt-1">Replay this request to compare responses</p>
      </div>
    );
  }

  const statusChanged = original.status !== replay.status;
  const latencyDiff = replay.latency - original.latency;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Original</span>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={original.status} />
            <span className="text-xs font-mono text-muted-foreground">{original.latency}ms</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Replayed</span>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={replay.status} />
            <span className="text-xs font-mono text-muted-foreground">
              {replay.latency}ms
              {latencyDiff !== 0 && (
                <span className={latencyDiff > 0 ? "text-status-4xx ml-1" : "text-status-2xx ml-1"}>
                  ({latencyDiff > 0 ? "+" : ""}{latencyDiff}ms)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {statusChanged && (
        <div className="px-3 py-2 rounded bg-status-4xx/10 text-status-4xx text-xs font-medium">
          Status code changed: {original.status} → {replay.status}
        </div>
      )}

      <div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Response Bodies</span>
        <div className="grid grid-cols-2 gap-2">
          <BodyView body={original.responseBody} />
          <BodyView body={replay.responseBody} />
        </div>
      </div>
    </div>
  );
}
