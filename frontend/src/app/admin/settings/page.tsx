"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { User, Bell, Shield, Building2, ChevronRight, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { setAuthSession, getToken } from "@/lib/cookies";
import type { User as UserType } from "@/types";

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

function SectionCard({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
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

function FieldRow({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
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

const inputClass =
	"w-full h-10 rounded-2xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors";

export default function SettingsPage() {
	const { user, refreshUser } = useAuth();

	const [form, setForm] = useState({ displayName: "", phone: "", bio: "" });
	const [notifications, setNotifications] = useState({
		newRequest: true,
		requestApproved: true,
		newMessage: false,
		weeklyReport: true,
		systemAlerts: true,
	});
	const [twoFA, setTwoFA] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (user) {
			setForm({
				displayName: user.displayName || "",
				phone: user.phone || "",
				bio: user.bio || "",
			});
		}
	}, [user]);

	async function handleSave() {
		setSaving(true);
		setError("");
		try {
			const res = await api.put("/auth/profile", form);
			const updated = res.data.data as UserType;
			const token = getToken();
			if (token) setAuthSession(token, updated);
			refreshUser();
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch {
			setError("Failed to save. Please try again.");
		} finally {
			setSaving(false);
		}
	}

	const initials = (form.displayName || user?.email || "?")[0].toUpperCase();

	return (
		<AdminLayout title="Settings" subtitle="Manage your account and preferences.">
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Left column */}
				<div className="xl:col-span-2 space-y-6">
					{/* Profile */}
					<SectionCard title="Profile" icon={User}>
						<div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
							<div
								className="size-20 rounded-3xl bg-primary-soft flex items-center justify-center font-display font-bold text-2xl text-primary-deep shrink-0"
							>
								{initials}
							</div>
							<div>
								<p className="font-display font-semibold text-lg">
									{form.displayName || user?.email}
								</p>
								<p className="text-sm text-muted-foreground capitalize">
									{user?.role} · {user?.email}
								</p>
								<span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/15 px-2.5 py-0.5 rounded-full">
									<div className="size-1.5 rounded-full bg-success" /> Active
								</span>
							</div>
						</div>

						<FieldRow label="Full name">
							<input
								value={form.displayName}
								onChange={(e) => setForm({ ...form, displayName: e.target.value })}
								placeholder="Your name"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Email address">
							<div className="h-10 rounded-2xl border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground">
								{user?.email}
							</div>
						</FieldRow>
						<FieldRow label="Phone" hint="Used for urgent alerts">
							<input
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
								type="tel"
								placeholder="+1 (555) 000-0000"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Role" hint="Contact support to change">
							<div className="h-10 rounded-2xl border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground capitalize">
								{user?.role}
							</div>
						</FieldRow>
						<FieldRow label="Bio" hint="Shown on your public profile">
							<textarea
								value={form.bio}
								onChange={(e) => setForm({ ...form, bio: e.target.value })}
								rows={3}
								maxLength={500}
								placeholder="Tell us about yourself..."
								className="w-full rounded-2xl border border-input bg-secondary/40 px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors"
							/>
						</FieldRow>
					</SectionCard>

					{/* Notifications */}
					<SectionCard title="Notifications" icon={Bell}>
						{(
							[
								{
									key: "newRequest",
									label: "New adoption request",
									hint: "Notify when a user submits a new request",
								},
								{
									key: "requestApproved",
									label: "Request status update",
									hint: "When a request is approved or rejected",
								},
								{
									key: "newMessage",
									label: "New message",
									hint: "Inbox messages from adopters or fosters",
								},
								{
									key: "weeklyReport",
									label: "Weekly summary report",
									hint: "Digest of weekly activity every Monday",
								},
								{
									key: "systemAlerts",
									label: "System alerts",
									hint: "Critical issues or maintenance windows",
								},
							] as const
						).map(({ key, label, hint }) => (
							<FieldRow key={key} label={label} hint={hint}>
								<div className="flex justify-end">
									<Toggle
										checked={notifications[key]}
										onChange={() =>
											setNotifications((prev) => ({
												...prev,
												[key]: !prev[key],
											}))
										}
									/>
								</div>
							</FieldRow>
						))}
					</SectionCard>

					{/* Security */}
					<SectionCard title="Security" icon={Shield}>
						<FieldRow label="Current password">
							<input
								type="password"
								placeholder="••••••••"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="New password" hint="Min 8 characters">
							<input
								type="password"
								placeholder="••••••••"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Confirm password">
							<input
								type="password"
								placeholder="••••••••"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Two-factor auth" hint="Adds an extra layer of security">
							<div className="flex items-center justify-between">
								<span
									className={`text-xs font-medium ${twoFA ? "text-success" : "text-muted-foreground"}`}
								>
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
					{/* Shelter info */}
					<SectionCard title="Shelter Info" icon={Building2}>
						<FieldRow label="Shelter name">
							<input
								type="text"
								defaultValue="Snuggle Animal Shelter"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Address">
							<input
								type="text"
								defaultValue="123 Paw Lane, Brooklyn, NY"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Phone">
							<input
								type="tel"
								defaultValue="+1 (555) 987-6543"
								className={inputClass}
							/>
						</FieldRow>
						<FieldRow label="Capacity" hint="Max animals at once">
							<input
								type="number"
								defaultValue="120"
								className={inputClass}
							/>
						</FieldRow>
					</SectionCard>

					{/* Quick links */}
					<div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
						<div className="px-6 py-5 border-b border-border">
							<p className="font-display text-base font-semibold">Quick Links</p>
						</div>
						{["Privacy Policy", "Terms of Service", "Support Center", "Export All Data"].map(
							(label) => (
								<button
									key={label}
									className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-secondary/40 transition-colors border-b border-border last:border-0 text-sm text-muted-foreground hover:text-foreground"
								>
									{label}
									<ChevronRight className="size-4" />
								</button>
							)
						)}
					</div>
				</div>
			</div>

			{/* Save bar */}
			<div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-soft">
				{error && <p className="text-sm text-destructive">{error}</p>}
				<button
					onClick={handleSave}
					disabled={saving}
					className={`h-9 px-5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-60 ${
						saved
							? "bg-success text-primary-foreground"
							: "bg-gradient-primary text-primary-foreground shadow-glow"
					}`}
				>
					{saving ? (
						<>
							<Loader2 className="size-3.5 animate-spin" /> Saving…
						</>
					) : saved ? (
						<>
							<Check className="size-3.5" /> Saved!
						</>
					) : (
						"Save changes"
					)}
				</button>
			</div>
		</AdminLayout>
	);
}
