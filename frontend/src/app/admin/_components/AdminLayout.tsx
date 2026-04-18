import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-6 sm:p-8 lg:p-10 max-w-[1600px] mx-auto">
          {/* Topbar */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>
          <div style={{ animation: "admin-fade-in 0.4s ease-out" }}>{children}</div>
        </div>
      </main>
    </div>
  );
}
