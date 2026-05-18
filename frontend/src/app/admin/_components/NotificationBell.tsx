"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertCircle, X, Trash2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface AdminNotification {
	id: string;
	type: string;
	petId: string;
	petName: string;
	message: string;
	read: boolean;
	resolved: boolean;
	createdAt: string;
	resolvedAt?: string;
}

export function NotificationBell() {
	const [notifications, setNotifications] = useState<AdminNotification[]>([]);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const unread = notifications.filter((n) => !n.read).length;
	const urgent = notifications.filter((n) => !n.resolved && !n.read).length;

	useEffect(() => {
		fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
    
        // refetch when a health record is added
        const handler = () => fetchNotifications();
        window.addEventListener("notification-refresh", handler);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener("notification-refresh", handler);
        };

	}, []);

	// close on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	async function fetchNotifications() {
		try {
			const res = await api.get("/admin/notifications");
			setNotifications(res.data.data || []);
		} catch {
			// silently fail
		}
	}

	async function markAllRead() {
		try {
			await api.patch("/admin/notifications/mark-all-read");
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		} catch {
			// silently fail
		}
	}

    async function deleteNotification(id: string) {
        try {
            await api.delete(`/admin/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }

	async function dismiss(id: string) {
		try {
			await api.patch(`/admin/notifications/${id}/read`);
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n))
			);
		} catch {
			// silently fail
		}
	}

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen((v) => !v)}
				className="relative size-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-50"
				style={{ border: "1px solid #F0F0F0" }}
			>
				<Bell className="size-4" style={{ color: "#666" }} />
				{unread > 0 && (
					<span
						className="absolute -top-1 -right-1 size-4 rounded-full text-white flex items-center justify-center"
						style={{
							fontSize: "9px",
							fontWeight: 700,
							background: urgent > 0 ? "#C4857A" : "#7AADA1",
						}}
					>
						{unread > 9 ? "9+" : unread}
					</span>
				)}
			</button>

			{open && (
				<div
					className="absolute right-0 mt-2 w-80 rounded-2xl shadow-lg overflow-hidden z-50"
					style={{ background: "#fff", border: "1px solid #F0F0F0" }}
				>
					{/* Header */}
					<div
						className="flex items-center justify-between px-4 py-3 border-b"
						style={{ borderColor: "#F5F5F5" }}
					>
						<span
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								color: "#1C1C1C",
							}}
						>
							Notifications
						</span>
						{unread > 0 && (
							<button
								onClick={markAllRead}
								style={{ fontSize: "11px", color: "#7AADA1", fontWeight: 500 }}
							>
								Mark all read
							</button>
						)}
					</div>

					{/* List */}
					<div className="max-h-80 overflow-y-auto">
						{notifications.length === 0 ? (
							<p
								className="text-center py-8"
								style={{ fontSize: "13px", color: "#aaa" }}
							>
								No notifications
							</p>
						) : (
							notifications.map((n) => (
								<div
									key={n.id}
									className="flex items-start gap-3 px-4 py-3 border-b transition-colors"
									style={{
										borderColor: "#F5F5F5",
										background: n.read ? "#fff" : "#FAFAFA",
									}}
								>
									{/* Icon */}
									<div
										className="size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
										style={{
											background: n.resolved ? "#E8F4F1" : "#FAF0EE",
										}}
									>
										{n.resolved ? (
											<CheckCircle2
												className="size-4"
												style={{ color: "#216959" }}
											/>
										) : (
											<AlertCircle
												className="size-4"
												style={{ color: "#C4857A" }}
											/>
										)}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<p
											style={{
												fontSize: "12px",
												color: n.read ? "#888" : "#1C1C1C",
												fontWeight: n.read ? 400 : 500,
												lineHeight: "1.4",
											}}
										>
											{n.message}
										</p>
										<div className="flex items-center gap-2 mt-1">
											{!n.resolved && (
												<Link
													href={`/admin/health-records?petId=${n.petId}`}
													onClick={() => setOpen(false)}
													style={{
														fontSize: "10px",
														color: "#7AADA1",
														fontWeight: 500,
													}}
												>
													Edit record →
												</Link>
											)}
											{n.resolved && (
												<span
													style={{ fontSize: "10px", color: "#7AADA1" }}
												>
													✓ Record added
												</span>
											)}
										</div>
									</div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {/* Mark as read */}
                                        {!n.read && (
                                            <button
                                                onClick={() => dismiss(n.id)}
                                                className="size-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                title="Mark as read"
                                            >
                                                <CheckCircle2 className="size-3.5" style={{ color: "#7AADA1" }} />
                                            </button>
                                        )}
                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="size-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="size-3.5" style={{ color: "#C4857A" }} />
                                        </button>
                                    </div>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}