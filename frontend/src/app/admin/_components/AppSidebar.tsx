"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Users,
  HeartHandshake,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const navMain = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pets", label: "Pets", icon: PawPrint },
  { href: "/admin/requests", label: "Adoption Requests", icon: ClipboardList, badge: 12 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/donations", label: "Donations", icon: HeartHandshake },
];

const navSecondary = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 border-r border-sidebar-border bg-sidebar flex-col">
      {/* Brand */}
      <div className="px-7 pt-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <PawPrint className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground leading-none">Snuggle</h2>
            <p className="text-[11px] text-muted-foreground mt-1 tracking-wide">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground px-4 mb-2">
          Workspace
        </p>
        {navMain.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-sidebar-accent text-primary-deep font-semibold shadow-card"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground px-4 mt-8 mb-2">
          Account
        </p>
        {navSecondary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-colors",
              isActive(item.href)
                ? "bg-sidebar-accent text-primary-deep font-semibold shadow-card"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer card */}
      <div className="p-4">
        <div className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-glow relative overflow-hidden">
          <Sparkles className="absolute -top-2 -right-2 size-16 opacity-20" />
          <p className="text-[11px] uppercase tracking-widest opacity-80 mb-1">This week</p>
          <p className="font-display text-2xl font-semibold leading-tight">28 pets</p>
          <p className="text-xs opacity-90 mb-4">found loving homes 🐾</p>
          <button className="text-[11px] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100">
            View stories →
          </button>
        </div>
        <button className="mt-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm text-muted-foreground hover:bg-sidebar-accent/60 transition-colors">
          <LogOut className="size-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
