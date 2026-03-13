import { Activity, Menu } from "lucide-react";

interface NavbarProps {
  exchangeCount: number;
}

export function Navbar({ exchangeCount }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-2.5">
        <Activity className="h-5 w-5 text-primary" />
        <span className="text-base font-bold text-foreground tracking-tight">MEO</span>
        <span className="hidden sm:inline text-xs text-muted-foreground">HTTP Traffic Inspector</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-status-2xx animate-pulse-dot" />
          {exchangeCount} exchanges
        </span>
        <button className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors duration-100">
          <Menu className="h-4 w-4 text-foreground" />
        </button>
      </div>
    </header>
  );
}
