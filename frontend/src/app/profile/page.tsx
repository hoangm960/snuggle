"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { setAuthSession, getToken } from "@/lib/cookies";
import type { User as UserType } from "@/types";

const inputClass =
	"w-full h-11 rounded-2xl border px-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#7AADA1]";
const inputStyle = {
	borderColor: "#E8E8E8",
	background: "#FAFAFA",
	fontFamily: "'Poppins', sans-serif",
};

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 border-b last:border-0"
			style={{ borderColor: "#F0F0F0" }}
		>
			<div style={{ minWidth: "160px" }}>
				<p
					style={{
						fontSize: "13px",
						fontWeight: 600,
						color: "#333",
						fontFamily: "'Space Grotesk', sans-serif",
					}}
				>
					{label}
				</p>
				{hint && (
					<p style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{hint}</p>
				)}
			</div>
			<div className="flex-1">{children}</div>
		</div>
	);
}

export default function ProfilePage() {
	const router = useRouter();
	const { user, loading, refreshUser } = useAuth();

	const [form, setForm] = useState({ displayName: "", phone: "", bio: "" });
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading]);

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

	if (loading || !user) return null;

	const initials = (form.displayName || user.email || "?")[0].toUpperCase();

	return (
		<div
			className="min-h-screen"
			style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}
		>
			<Navbar />

			<div className="max-w-2xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1
						style={{
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "26px",
							fontWeight: 700,
							color: "#1C1C1C",
						}}
					>
						My Profile
					</h1>
					<p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
						Manage your account information.
					</p>
				</div>

				{/* Profile card */}
				<div
					className="rounded-3xl overflow-hidden mb-5"
					style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
				>
					{/* Avatar header */}
					<div
						className="px-8 py-6 flex items-center gap-5"
						style={{ borderBottom: "1px solid #F0F0F0" }}
					>
						<div
							className="size-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0"
							style={{
								background: "#E8F4F1",
								color: "#216959",
								fontFamily: "'Space Grotesk', sans-serif",
							}}
						>
							{initials}
						</div>
						<div>
							<p
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "18px",
									fontWeight: 700,
									color: "#1C1C1C",
								}}
							>
								{form.displayName || user.email}
							</p>
							<p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
								{user.email}
							</p>
							<span
								className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full"
								style={{
									background: "#E8F4F1",
									color: "#216959",
									fontSize: "11px",
									fontWeight: 600,
								}}
							>
								<div
									className="size-1.5 rounded-full"
									style={{ background: "#216959" }}
								/>
								Active
							</span>
						</div>
					</div>

					{/* Fields */}
					<div className="px-8">
						<Field label="Full name">
							<input
								value={form.displayName}
								onChange={(e) => setForm({ ...form, displayName: e.target.value })}
								placeholder="Your name"
								className={inputClass}
								style={inputStyle}
							/>
						</Field>
						<Field label="Email address">
							<div
								className="h-11 rounded-2xl border px-4 flex items-center text-sm"
								style={{
									borderColor: "#E8E8E8",
									background: "#F4F4F4",
									color: "#999",
									fontFamily: "'Poppins', sans-serif",
								}}
							>
								{user.email}
							</div>
						</Field>
						<Field label="Phone" hint="Optional contact number">
							<input
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
								type="tel"
								placeholder="+1 (555) 000-0000"
								className={inputClass}
								style={inputStyle}
							/>
						</Field>
						<Field label="Bio" hint="Up to 500 characters">
							<textarea
								value={form.bio}
								onChange={(e) => setForm({ ...form, bio: e.target.value })}
								rows={4}
								maxLength={500}
								placeholder="Tell us a little about yourself..."
								className="w-full rounded-2xl border px-4 py-3 text-sm resize-none outline-none transition-colors focus:ring-2 focus:ring-[#7AADA1]"
								style={{ ...inputStyle, lineHeight: "1.6" }}
							/>
							<p
								style={{
									fontSize: "11px",
									color: "#bbb",
									textAlign: "right",
									marginTop: "4px",
								}}
							>
								{form.bio.length} / 500
							</p>
						</Field>
					</div>
				</div>

				{/* Security note */}
				<div
					className="rounded-2xl px-5 py-4 flex items-start gap-3 mb-8"
					style={{ background: "#fff", border: "1px solid #F0F0F0" }}
				>
					<Shield className="size-4 shrink-0 mt-0.5" style={{ color: "#7AADA1" }} />
					<p style={{ fontSize: "13px", color: "#666" }}>
						To change your password or email, please contact support or use the password
						reset flow from the login page.
					</p>
				</div>

				{error && (
					<p style={{ color: "#C4857A", fontSize: "13px", marginBottom: "12px" }}>
						{error}
					</p>
				)}

				<button
					onClick={handleSave}
					disabled={saving}
					className="w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
					style={{
						background: saved ? "#216959" : "#7AADA1",
						color: "#fff",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "15px",
					}}
				>
					{saving ? (
						<>
							<Loader2 className="size-4 animate-spin" /> Saving…
						</>
					) : saved ? (
						<>
							<Check className="size-4" /> Saved!
						</>
					) : (
						"Save changes"
					)}
				</button>
			</div>
		</div>
	);
}
