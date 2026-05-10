"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { Star, Search, CheckCircle2, Flag, Trash2, X, Loader2, RefreshCw } from "lucide-react";
import { useReviews, type Review } from "@/hooks/useReviews";

type StatusFilter = "all" | "pending" | "approved" | "flagged" | "removed";

const statusConfig: Record<string, { label: string; badge: string }> = {
	pending: { label: "Pending", badge: "bg-warning/15 text-warning" },
	approved: { label: "Published", badge: "bg-success/15 text-success" },
	flagged: { label: "Flagged", badge: "bg-destructive/15 text-destructive" },
	removed: { label: "Removed", badge: "bg-muted text-muted-foreground" },
};

const TABS: { key: StatusFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "pending", label: "Pending" },
	{ key: "approved", label: "Published" },
	{ key: "flagged", label: "Flagged" },
	{ key: "removed", label: "Removed" },
];

function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<Star
					key={i}
					className="size-3.5"
					fill={i <= rating ? "#F5A623" : "none"}
					style={{ color: i <= rating ? "#F5A623" : "#E0E0E0" }}
				/>
			))}
		</div>
	);
}

function Initials({ name }: { name: string }) {
	const letters = name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return (
		<div className="size-8 rounded-full bg-primary-soft flex items-center justify-center text-xs font-bold text-primary-deep shrink-0">
			{letters}
		</div>
	);
}

function formatDate(date: Date | string | undefined) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function ReviewsPage() {
	const { reviews, loading, error, fetchReviews, updateStatus } = useReviews();
	const [search, setSearch] = useState("");
	const [tab, setTab] = useState<StatusFilter>("all");
	const [selected, setSelected] = useState<Review | null>(null);
	const [updating, setUpdating] = useState<string | null>(null);

	const filtered = reviews.filter((r) => {
		const matchSearch =
			(r.reviewerName || "").toLowerCase().includes(search.toLowerCase()) ||
			(r.comment || "").toLowerCase().includes(search.toLowerCase());
		const matchStatus = tab === "all" || r.status === tab;
		return matchSearch && matchStatus;
	});

	const counts: Record<StatusFilter, number> = {
		all: reviews.length,
		pending: reviews.filter((r) => r.status === "pending").length,
		approved: reviews.filter((r) => r.status === "approved").length,
		flagged: reviews.filter((r) => r.status === "flagged").length,
		removed: reviews.filter((r) => r.status === "removed").length,
	};

	const handleAction = async (review: Review, status: Review["status"]) => {
		if (!review.id || !review.shelterId) return;
		setUpdating(review.id);
		await updateStatus(review.shelterId, review.id, status);
		setUpdating(null);
		setSelected(null);
	};

	return (
		<AdminLayout title="Reviews & Ratings" subtitle="Moderate adoption experience reviews from adopters.">
			{/* Tabs */}
			<div className="flex gap-2 mb-6 overflow-x-auto pb-1">
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setTab(key)}
						className={`px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
							tab === key
								? "bg-primary text-primary-foreground shadow-glow"
								: "bg-card border border-border text-muted-foreground hover:text-foreground"
						}`}
					>
						{label}
						<span
							className={`text-[11px] px-2 py-0.5 rounded-full ${
								tab === key ? "bg-primary-foreground/20" : "bg-secondary"
							}`}
						>
							{counts[key]}
						</span>
					</button>
				))}
				<button
					onClick={fetchReviews}
					className="ml-auto size-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
					title="Refresh"
				>
					<RefreshCw className="size-4" />
				</button>
			</div>

			{/* Search */}
			<div className="relative mb-5">
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by reviewer or comment..."
					className="w-full pl-10 pr-4 h-11 rounded-2xl border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			{/* States */}
			{loading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : error ? (
				<div className="text-center py-20">
					<p className="text-destructive text-sm mb-3">{error}</p>
					<button onClick={fetchReviews} className="text-sm font-semibold text-primary-deep hover:underline">
						Try again
					</button>
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-20">
					<Star className="size-10 mx-auto mb-3 text-muted" />
					<p className="text-muted-foreground text-sm">No reviews found.</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((review) => {
						const cfg = statusConfig[review.status] || statusConfig.pending;
						const isUpdating = updating === review.id;
						const name = review.reviewerName || "Unknown";

						return (
							<article
								key={review.id}
								className="bg-card border border-border rounded-3xl p-5 shadow-card hover:shadow-soft transition-shadow"
							>
								<div className="flex items-start gap-4">
									<Initials name={name} />
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<p className="text-sm font-semibold">{name}</p>
											{review.reviewerEmail && (
												<p className="text-xs text-muted-foreground">{review.reviewerEmail}</p>
											)}
											<span className={`ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
												{cfg.label}
											</span>
										</div>
										<div className="flex items-center gap-2 mb-2">
											<StarRating rating={review.rating} />
											<span className="text-xs text-muted-foreground">{review.rating}/5</span>
											<span className="text-xs text-muted-foreground">·</span>
											<span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
										</div>
										{review.comment && (
											<p className="text-sm text-foreground/70 leading-relaxed mb-3">{review.comment}</p>
										)}
										{/* Actions */}
										{review.status !== "removed" && (
											<div className="flex items-center gap-2">
												{review.status === "approved" && (
													<button
														onClick={() => handleAction(review, "flagged")}
														disabled={isUpdating}
														className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
													>
														{isUpdating ? <Loader2 className="size-3 animate-spin" /> : <Flag className="size-3" />}
														Flag
													</button>
												)}
												{(review.status === "flagged" || review.status === "pending") && (
													<button
														onClick={() => handleAction(review, "approved")}
														disabled={isUpdating}
														className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-success/10 text-success text-xs font-semibold hover:bg-success hover:text-primary-foreground transition-colors disabled:opacity-50"
													>
														{isUpdating ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
														Approve
													</button>
												)}
												<button
													onClick={() => handleAction(review, "removed")}
													disabled={isUpdating}
													className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
												>
													{isUpdating ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
													Remove
												</button>
												<button
													onClick={() => setSelected(review)}
													className="ml-auto text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
												>
													View details
												</button>
											</div>
										)}
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{/* Detail Modal */}
			{selected && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
					onClick={() => setSelected(null)}
				>
					<div
						className="w-[500px] bg-card rounded-3xl p-6 shadow-xl border border-border"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-5">
							<h3 className="font-display text-lg font-semibold">Review Details</h3>
							<button
								onClick={() => setSelected(null)}
								className="size-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="p-4 rounded-2xl bg-secondary/50 mb-4">
							<div className="flex items-center gap-3 mb-3">
								<Initials name={selected.reviewerName || "?"} />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold">{selected.reviewerName || "Unknown"}</p>
									{selected.reviewerEmail && (
										<p className="text-xs text-muted-foreground">{selected.reviewerEmail}</p>
									)}
								</div>
								<div className="text-right">
									<StarRating rating={selected.rating} />
									<p className="text-[10px] text-muted-foreground mt-0.5">{selected.rating}/5</p>
								</div>
							</div>
							{selected.comment && (
								<p className="text-sm text-foreground/70 leading-relaxed">{selected.comment}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3 mb-5 text-xs">
							<div className="p-3 rounded-xl bg-secondary/50">
								<p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Shelter ID</p>
								<p className="font-mono font-medium">{selected.shelterId?.slice(0, 12) || "—"}</p>
							</div>
							<div className="p-3 rounded-xl bg-secondary/50">
								<p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Submitted</p>
								<p className="font-medium">{formatDate(selected.createdAt)}</p>
							</div>
						</div>

						{selected.status !== "removed" && (
							<div className="flex gap-3">
								{selected.status === "approved" ? (
									<button
										onClick={() => handleAction(selected, "flagged")}
										disabled={updating === selected.id}
										className="flex-1 h-10 rounded-full bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
									>
										<Flag className="size-4" /> Flag
									</button>
								) : (
									<button
										onClick={() => handleAction(selected, "approved")}
										disabled={updating === selected.id}
										className="flex-1 h-10 rounded-full bg-success/10 text-success font-semibold text-sm flex items-center justify-center gap-2 hover:bg-success hover:text-primary-foreground transition-colors disabled:opacity-50"
									>
										<CheckCircle2 className="size-4" /> Approve
									</button>
								)}
								<button
									onClick={() => handleAction(selected, "removed")}
									disabled={updating === selected.id}
									className="flex-1 h-10 rounded-full bg-muted text-muted-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
								>
									<Trash2 className="size-4" /> Remove
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
