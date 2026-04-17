"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  iconBg?: "primary" | "warm" | "soft" | "muted";
  highlight?: boolean;
}

const iconBgMap = {
  primary: "bg-primary-soft text-primary-deep",
  warm: "bg-accent/15 text-accent",
  soft: "bg-muted text-foreground",
  muted: "bg-secondary text-muted-foreground",
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function StatCard({ label, value, icon: Icon, trend, iconBg = "primary", highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl border transition-all hover:-translate-y-0.5",
        highlight
          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
          : "bg-card border-border shadow-card",
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <p className={cn("text-sm font-medium", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {label}
        </p>
        <div
          className={cn(
            "size-10 rounded-2xl flex items-center justify-center",
            highlight ? "bg-white/20 text-primary-foreground" : iconBgMap[iconBg],
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
      {trend && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs font-medium",
            highlight
              ? "text-primary-foreground/90"
              : trend.up
                ? "text-success"
                : "text-destructive",
          )}
        >
          {trend.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          <span>{trend.value}</span>
          <span className={cn("font-normal", highlight ? "opacity-70" : "text-muted-foreground")}>
            from yesterday
          </span>
        </div>
      )}
    </div>
  );
}
