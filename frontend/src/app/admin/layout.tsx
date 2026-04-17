import { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div data-admin className="min-h-screen" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
