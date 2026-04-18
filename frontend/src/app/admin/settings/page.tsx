"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import {
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  Camera,
  ChevronRight,
  Check,
} from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="size-9 rounded-2xl bg-primary-soft flex items-center justify-center">
          <Icon className="size-4 text-primary-deep" />
        </div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b border-border last:border-0">
      <div className="sm:w-48 shrink-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({ defaultValue, placeholder, type = "text" }: { defaultValue?: string; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full h-10 rounded-2xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors"
    />
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newRequest: true,
    requestApproved: true,
    newDonation: true,
    newMessage: false,
    weeklyReport: true,
    systemAlerts: true,
  });

  const [twoFA, setTwoFA] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminLayout title="Settings" subtitle="Manage your account, preferences and shelter information.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Profile */}
          <SectionCard title="Profile" icon={User}>
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/80?img=44"
                  alt="Samantha Hill"
                  className="size-20 rounded-3xl object-cover"
                />
                <button className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary flex items-center justify-center shadow-glow">
                  <Camera className="size-3.5 text-primary-foreground" />
                </button>
              </div>
              <div>
                <p className="font-display font-semibold text-lg">Samantha Hill</p>
                <p className="text-sm text-muted-foreground">Admin · samantha@snuggle.org</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/15 px-2.5 py-0.5 rounded-full">
                  <div className="size-1.5 rounded-full bg-success" /> Active
                </span>
              </div>
            </div>
            <FieldRow label="Full name">
              <TextInput defaultValue="Samantha Hill" />
            </FieldRow>
            <FieldRow label="Email address">
              <TextInput defaultValue="samantha@snuggle.org" type="email" />
            </FieldRow>
            <FieldRow label="Phone" hint="Used for urgent alerts">
              <TextInput defaultValue="+1 (555) 012-3456" type="tel" />
            </FieldRow>
            <FieldRow label="Role" hint="Contact support to change">
              <div className="h-10 rounded-2xl border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground">
                Administrator
              </div>
            </FieldRow>
            <FieldRow label="Bio" hint="Shown on your public profile">
              <textarea
                defaultValue="Passionate about animal welfare and connecting pets with forever homes."
                rows={3}
                className="w-full rounded-2xl border border-input bg-secondary/40 px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors"
              />
            </FieldRow>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" icon={Bell}>
            {([
              { key: "newRequest", label: "New adoption request", hint: "Notify when a user submits a new request" },
              { key: "requestApproved", label: "Request status update", hint: "When a request is approved or rejected" },
              { key: "newDonation", label: "New donation received", hint: "Get notified for every incoming donation" },
              { key: "newMessage", label: "New message", hint: "Inbox messages from adopters or fosters" },
              { key: "weeklyReport", label: "Weekly summary report", hint: "Digest of weekly activity every Monday" },
              { key: "systemAlerts", label: "System alerts", hint: "Critical issues or maintenance windows" },
            ] as const).map(({ key, label, hint }) => (
              <FieldRow key={key} label={label} hint={hint}>
                <div className="flex justify-end">
                  <Toggle checked={notifications[key]} onChange={() => toggle(key)} />
                </div>
              </FieldRow>
            ))}
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security" icon={Shield}>
            <FieldRow label="Current password">
              <TextInput placeholder="••••••••" type="password" />
            </FieldRow>
            <FieldRow label="New password" hint="Min 8 characters">
              <TextInput placeholder="••••••••" type="password" />
            </FieldRow>
            <FieldRow label="Confirm password">
              <TextInput placeholder="••••••••" type="password" />
            </FieldRow>
            <FieldRow label="Two-factor auth" hint="Adds an extra layer of security">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${twoFA ? "text-success" : "text-muted-foreground"}`}>
                  {twoFA ? "Enabled" : "Disabled"}
                </span>
                <Toggle checked={twoFA} onChange={() => setTwoFA(!twoFA)} />
              </div>
            </FieldRow>
            <div className="pt-4">
              <button className="text-xs font-semibold text-destructive hover:underline">
                Sign out of all devices
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Appearance */}
          <SectionCard title="Appearance" icon={Palette}>
            <FieldRow label="Dark mode" hint="Switch to dark theme">
              <div className="flex justify-end">
                <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              </div>
            </FieldRow>
            <FieldRow label="Compact view" hint="Reduce table row spacing">
              <div className="flex justify-end">
                <Toggle checked={compactView} onChange={() => setCompactView(!compactView)} />
              </div>
            </FieldRow>
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Accent colour</p>
              <div className="flex gap-2.5">
                {[
                  { color: "hsl(170 22% 58%)", active: true },
                  { color: "hsl(24 50% 58%)", active: false },
                  { color: "hsl(230 50% 60%)", active: false },
                  { color: "hsl(280 40% 60%)", active: false },
                  { color: "hsl(340 55% 60%)", active: false },
                ].map(({ color, active }) => (
                  <button
                    key={color}
                    className="size-8 rounded-full flex items-center justify-center border-2 transition-all"
                    style={{ background: color, borderColor: active ? color : "transparent", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px" }}
                  >
                    {active && <Check className="size-3.5 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Shelter info */}
          <SectionCard title="Shelter Info" icon={Building2}>
            <FieldRow label="Shelter name">
              <TextInput defaultValue="Snuggle Animal Shelter" />
            </FieldRow>
            <FieldRow label="Address">
              <TextInput defaultValue="123 Paw Lane, Brooklyn, NY" />
            </FieldRow>
            <FieldRow label="Phone">
              <TextInput defaultValue="+1 (555) 987-6543" type="tel" />
            </FieldRow>
            <FieldRow label="Capacity" hint="Max animals at once">
              <TextInput defaultValue="120" type="number" />
            </FieldRow>
          </SectionCard>

          {/* Quick links */}
          <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <p className="font-display text-base font-semibold">Quick Links</p>
            </div>
            {[
              "Privacy Policy",
              "Terms of Service",
              "Support Center",
              "Export All Data",
            ].map((label) => (
              <button
                key={label}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-secondary/40 transition-colors border-b border-border last:border-0 text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
                <ChevronRight className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-soft">
        <p className="text-sm text-muted-foreground">Unsaved changes</p>
        <button
          onClick={handleSave}
          className={`h-9 px-5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${saved ? "bg-success text-primary-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}
        >
          {saved ? <><Check className="size-3.5" /> Saved!</> : "Save changes"}
        </button>
      </div>
    </AdminLayout>
  );
}
