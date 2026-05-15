"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { AdminLayout } from "../_components/AdminLayout";
import { User, Bell, Shield, Camera, Check, Loader2, AlertCircle, X } from "lucide-react";
import api from "@/lib/api";
import { User as UserType, NotificationPrefs } from "@/types";

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

function TextInput({
	value,
	onChange,
	placeholder,
	type = "text",
	disabled,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
}) {
	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className="w-full h-10 rounded-2xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors disabled:cursor-not-allowed disabled:opacity-60"
		/>
	);
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
	newRequest: true,
	requestApproved: true,
	newMessage: false,
	weeklyReport: true,
	systemAlerts: true,
};

export default function SettingsPage() {
	const [profile, setProfile] = useState({
		displayName: "",
		email: "",
		phone: "",
		bio: "",
		role: "visitor",
		photoURL: "",
	});
	const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	const [passwords, setPasswords] = useState({
		current: "",
		new: "",
		confirm: "",
	});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [avatarUploading, setAvatarUploading] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const fetchProfile = useCallback(async () => {
		try {
			const res = await api.get("/auth/profile");
			const user: UserType = res.data.data;
			setProfile({
				displayName: user.displayName || "",
				email: user.email || "",
				phone: user.phone || "",
				bio: user.bio || "",
				role: user.role || "visitor",
				photoURL: user.photoURL || "",
			});
			if (user.notificationPrefs) {
				setNotifications(user.notificationPrefs);
			}
		} catch {
			setError("Failed to load profile");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	function markDirty() {
		setIsDirty(true);
	}

	function toggleNotification(key: keyof NotificationPrefs) {
		setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
		markDirty();
	}

	function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
		markDirty();
	}

	async function handleAvatarUpload(): Promise<string | null> {
		if (!avatarFile) return null;
		setAvatarUploading(true);
		try {
			const formData = new FormData();
			formData.append("avatar", avatarFile);
			const res = await api.post("/auth/avatar", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data.data.photoURL as string;
		} catch {
			setError("Failed to upload avatar");
			return null;
		} finally {
			setAvatarUploading(false);
		}
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		setPasswordError(null);

		try {
			if (avatarFile) {
				const photoURL = await handleAvatarUpload();
				if (photoURL) {
					setProfile((p) => ({ ...p, photoURL }));
					setAvatarFile(null);
				}
			}

			await api.put("/auth/profile", {
				displayName: profile.displayName,
				phone: profile.phone,
				bio: profile.bio,
			});

			await api.put("/auth/notifications", notifications);

			if (passwords.current && passwords.new && passwords.confirm) {
				if (passwords.new !== passwords.confirm) {
					setPasswordError("New passwords do not match");
					setSaving(false);
					return;
				}
				try {
					await api.put("/auth/password", {
						currentPassword: passwords.current,
						newPassword: passwords.new,
					});
				} catch (err: unknown) {
					const msg =
						err instanceof Error
							? err.message
							: (err as { response?: { data?: { message?: string } } })?.response
									?.data?.message || "Failed to change password";
					setPasswordError(msg);
					setSaving(false);
					return;
				}
				setPasswords({ current: "", new: "", confirm: "" });
			}

			setIsDirty(false);
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			setError("Failed to save settings");
		} finally {
			setSaving(false);
		}
	}

	const roleLabel =
		profile.role === "admin"
			? "Administrator"
			: profile.role === "shelter"
				? "Shelter"
				: profile.role === "adopter"
					? "Adopter"
					: "Visitor";

	if (loading) {
		return (
			<AdminLayout
				title="Settings"
				subtitle="Manage your account, preferences and shelter information."
			>
				<div className="flex items-center justify-center py-32">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout
			title="Settings"
			subtitle="Manage your account, preferences and shelter information."
		>
			<div className="p-8">
				{error && (
					<div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 mb-4">
						<AlertCircle className="size-4 text-destructive shrink-0" />
						<p className="text-sm text-destructive flex-1">{error}</p>
						<button onClick={() => setError(null)} className="shrink-0">
							<X className="size-4 text-destructive" />
						</button>
					</div>
				)}

				<div className="space-y-6">
					{/* Profile */}
					<SectionCard title="Profile" icon={User}>
						<div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
							<div className="relative shrink-0">
								{avatarUploading ? (
									<div className="size-20 rounded-3xl bg-muted flex items-center justify-center">
										<Loader2 className="size-5 animate-spin text-muted-foreground" />
									</div>
								) : avatarPreview || profile.photoURL ? (
									<Image
										src={avatarPreview || profile.photoURL}
										alt={profile.displayName}
										width={80}
										height={80}
										className="size-20 rounded-3xl object-cover"
									/>
								) : (
									<div
										className="size-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground font-display font-semibold text-xl"
										style={{ fontFamily: "'Space Grotesk', sans-serif" }}
									>
										{profile.displayName
											? profile.displayName
													.split(" ")
													.slice(0, 2)
													.map((n) => n[0])
													.join("")
													.toUpperCase()
											: "?"}
									</div>
								)}
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/png,image/webp"
									className="hidden"
									onChange={handleAvatarChange}
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									disabled={avatarUploading}
									className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary flex items-center justify-center shadow-glow disabled:opacity-50"
								>
									<Camera className="size-3.5 text-primary-foreground" />
								</button>
							</div>
							<div>
								<p className="font-display font-semibold text-lg">
									{profile.displayName || "—"}
								</p>
								<p className="text-sm text-muted-foreground">{profile.email}</p>
								<span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/15 px-2.5 py-0.5 rounded-full">
									<div className="size-1.5 rounded-full bg-success" /> Active
								</span>
							</div>
						</div>

						<FieldRow label="Full name">
							<TextInput
								value={profile.displayName}
								onChange={(v) => {
									setProfile((p) => ({ ...p, displayName: v }));
									markDirty();
								}}
							/>
						</FieldRow>
						<FieldRow label="Email address">
							<TextInput value={profile.email} onChange={() => {}} disabled />
						</FieldRow>
						<FieldRow label="Phone" hint="Used for urgent alerts">
							<TextInput
								value={profile.phone}
								onChange={(v) => {
									setProfile((p) => ({ ...p, phone: v }));
									markDirty();
								}}
								type="tel"
							/>
						</FieldRow>
						<FieldRow label="Role" hint="Contact support to change">
							<div className="h-10 rounded-2xl border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground">
								{roleLabel}
							</div>
						</FieldRow>
						<FieldRow label="Bio" hint="Shown on your public profile">
							<textarea
								value={profile.bio}
								onChange={(e) => {
									setProfile((p) => ({ ...p, bio: e.target.value }));
									markDirty();
								}}
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
										onChange={() => toggleNotification(key)}
									/>
								</div>
							</FieldRow>
						))}
					</SectionCard>

					{/* Security */}
					<SectionCard title="Security" icon={Shield}>
						{passwordError && (
							<div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 mb-4">
								<AlertCircle className="size-4 text-destructive shrink-0" />
								<p className="text-sm text-destructive">{passwordError}</p>
							</div>
						)}
						<FieldRow label="Current password">
							<TextInput
								value={passwords.current}
								onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}
								type="password"
								placeholder="••••••••"
							/>
						</FieldRow>
						<FieldRow label="New password" hint="Min 6 characters">
							<TextInput
								value={passwords.new}
								onChange={(v) => setPasswords((p) => ({ ...p, new: v }))}
								type="password"
								placeholder="••••••••"
							/>
						</FieldRow>
						<FieldRow label="Confirm password">
							<TextInput
								value={passwords.confirm}
								onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}
								type="password"
								placeholder="••••••••"
							/>
						</FieldRow>
						<div className="pt-4">
							<button className="text-xs font-semibold text-destructive hover:underline">
								Sign out of all devices
							</button>
						</div>
					</SectionCard>
				</div>

				{/* Save bar */}
				{isDirty && (
					<div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-soft">
						<p className="text-sm text-muted-foreground">Unsaved changes</p>
						<button
							onClick={handleSave}
							disabled={saving}
							className={`h-9 px-5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 ${saved ? "bg-success text-primary-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}
						>
							{saving ? (
								<>
									<Loader2 className="size-3.5 animate-spin" /> Saving...
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
				)}
			</div>
		</AdminLayout>
	);
}
