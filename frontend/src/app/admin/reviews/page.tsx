"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { Star, Search, CheckCircle2, Flag, Trash2, X } from "lucide-react";

interface Review {
	id: string;
	reviewer: string;
	reviewerEmail: string;
	petName: string;
	shelter: string;
	rating: number;
	comment: string;
	date: string;
	status: "published" | "flagged" | "removed";
}

const mockReviews: Review[] = [
	{ id: "RV-001", reviewer: "Sarah Johnson", reviewerEmail: "sarah@email.com", petName: "Mochi", shelter: "Happy Paws Shelter", rating: 5, comment: "The adoption process was smooth and the staff was incredibly helpful. Mochi has settled in perfectly!", date: "Apr 26, 2026", status: "published" },
	{ id: "RV-002", reviewer: "David Kim", reviewerEmail: "david@email.com", petName: "Luna", shelter: "City Animal Rescue", rating: 4, comment: "Great experience overall. The shelter staff gave us all the information we needed. Luna is adjusting well.", date: "Apr 25, 2026", status: "published" },
	{ id: "RV-003", reviewer: "Anonymous", reviewerEmail: "anon@email.com", petName: "Charlie", shelter: "Happy Paws Shelter", rating: 1, comment: "This shelter scammed me!!! Do not trust them.", date: "Apr 24, 2026", status: "flagged" },
	{ id: "RV-004", reviewer: "James Wilson", reviewerEmail: "james@email.com", petName: "Bella", shelter: "Furry Friends Hub", rating: 5, comment: "Wonderful experience. The team was professional and caring. Bella is the best thing that happened to our family.", date: "Apr 23, 2026", status: "published" },
	{ id: "RV-005", reviewer: "Spam Account", reviewerEmail: "spam@fake.com", petName: "Max", shelter: "City Animal Rescue", rating: 1, comment: "Buy followers cheap at www.spam.com", date: "Apr 22, 2026", status: "removed" },
];

const statusConfig = {
	published: { label: "Published", color: "#216959", bg: "#E8F4F1" },
	flagged: { label: "Flagged", color: "#C4857A", bg: "#FAF0EE" },
	removed: { label: "Removed", color: "#999", bg: "#F4F4F4" },
};

function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<Star key={i} className="size-3.5" fill={i <= rating ? "#F5A623" : "none"} style={{ color: i <= rating ? "#F5A623" : "#E0E0E0" }} />
			))}
		</div>
	);
}

export default function ReviewsPage() {
	const [reviews, setReviews] = useState(mockReviews);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selected, setSelected] = useState<Review | null>(null);

	const filtered = reviews.filter((r) => {
		const matchSearch = r.reviewer.toLowerCase().includes(search.toLowerCase()) || r.petName.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "all" || r.status === statusFilter;
		return matchSearch && matchStatus;
	});

	function setStatus(id: string, status: Review["status"]) {
		setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
		setSelected(null);
	}

	function remove(id: string) {
		setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "removed" } : r));
		setSelected(null);
	}

	const counts = { all: reviews.length, published: reviews.filter((r) => r.status === "published").length, flagged: reviews.filter((r) => r.status === "flagged").length, removed: reviews.filter((r) => r.status === "removed").length };

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex items-center gap-3 mb-8">
					<div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "#E8F4F1" }}>
						<Star className="size-5" style={{ color: "#7AADA1" }} />
					</div>
					<div>
						<h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, color: "#1C1C1C" }}>Reviews & Ratings</h1>
						<p style={{ color: "#888", fontSize: "13px" }}>Moderate adoption experience reviews</p>
					</div>
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-4 gap-4 mb-6">
					{[
						{ label: "Total Reviews", value: counts.all, color: "#7AADA1", bg: "#E8F4F1" },
						{ label: "Published", value: counts.published, color: "#216959", bg: "#E8F4F1" },
						{ label: "Flagged", value: counts.flagged, color: "#C4857A", bg: "#FAF0EE" },
						{ label: "Removed", value: counts.removed, color: "#999", bg: "#F4F4F4" },
					].map((s) => (
						<div key={s.label} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
							<p style={{ fontSize: "24px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>{s.value}</p>
							<p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.label}</p>
						</div>
					))}
				</div>

				<div className="flex gap-3 mb-5">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#ccc" }} />
						<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..."
							className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
							style={{ background: "#fff", border: "1px solid #E8E8E8", color: "#333" }} />
					</div>
					<div className="flex gap-2">
						{(["all", "published", "flagged", "removed"] as const).map((tab) => (
							<button key={tab} onClick={() => setStatusFilter(tab)}
								className="px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize"
								style={{ background: statusFilter === tab ? "#216959" : "#fff", color: statusFilter === tab ? "#fff" : "#666", border: "1px solid", borderColor: statusFilter === tab ? "#216959" : "#E8E8E8" }}>
								{tab}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-3">
					{filtered.map((review) => {
						const sc = statusConfig[review.status];
						return (
							<div key={review.id} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
												{review.reviewer.charAt(0)}
											</div>
											<div>
												<p style={{ fontSize: "13px", fontWeight: 600, color: "#1C1C1C" }}>{review.reviewer}</p>
												<p style={{ fontSize: "11px", color: "#aaa" }}>{review.reviewerEmail}</p>
											</div>
											<div className="ml-2">
												<StarRating rating={review.rating} />
											</div>
											<span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
										</div>
										<p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>{review.comment}</p>
										<div className="flex items-center gap-3 mt-3" style={{ fontSize: "11px", color: "#aaa" }}>
											<span>Pet: <strong style={{ color: "#666" }}>{review.petName}</strong></span>
											<span>·</span>
											<span>Shelter: <strong style={{ color: "#666" }}>{review.shelter}</strong></span>
											<span>·</span>
											<span>{review.date}</span>
										</div>
									</div>
									<div className="flex items-center gap-1.5 shrink-0">
										<button onClick={() => setSelected(review)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
											style={{ border: "1px solid #E8E8E8" }}>
											<Star className="size-3.5" style={{ color: "#888" }} />
										</button>
										{review.status === "published" && (
											<button onClick={() => setStatus(review.id, "flagged")} className="size-8 rounded-lg flex items-center justify-center hover:bg-orange-50 transition-colors"
												style={{ border: "1px solid #E8E8E8" }}>
												<Flag className="size-3.5" style={{ color: "#C4857A" }} />
											</button>
										)}
										{review.status === "flagged" && (
											<button onClick={() => setStatus(review.id, "published")} className="size-8 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors"
												style={{ border: "1px solid #E8E8E8" }}>
												<CheckCircle2 className="size-3.5" style={{ color: "#216959" }} />
											</button>
										)}
										{review.status !== "removed" && (
											<button onClick={() => remove(review.id)} className="size-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
												style={{ border: "1px solid #E8E8E8" }}>
												<Trash2 className="size-3.5" style={{ color: "#C4857A" }} />
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
					{filtered.length === 0 && (
						<div className="text-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
							<Star className="size-10 mx-auto mb-3" style={{ color: "#E0E0E0" }} />
							<p style={{ color: "#aaa", fontSize: "14px" }}>No reviews found.</p>
						</div>
					)}
				</div>
			</div>

			{/* Detail Modal */}
			{selected && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
					<div className="w-[500px] rounded-2xl p-6" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "#1C1C1C" }}>Review Details</h3>
							<button onClick={() => setSelected(null)} className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
								<X className="size-4" style={{ color: "#888" }} />
							</button>
						</div>

						<div className="p-4 rounded-xl mb-4" style={{ background: "#F9F6F2" }}>
							<div className="flex items-center gap-2 mb-3">
								<div className="size-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
									{selected.reviewer.charAt(0)}
								</div>
								<div>
									<p style={{ fontWeight: 600, color: "#1C1C1C" }}>{selected.reviewer}</p>
									<p style={{ fontSize: "12px", color: "#888" }}>{selected.reviewerEmail}</p>
								</div>
								<div className="ml-auto">
									<StarRating rating={selected.rating} />
									<p style={{ fontSize: "10px", color: "#aaa", textAlign: "right", marginTop: "2px" }}>{selected.rating}/5</p>
								</div>
							</div>
							<p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{selected.comment}</p>
						</div>

						<div className="grid grid-cols-2 gap-3 mb-5">
							<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
								<p style={{ fontSize: "10px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Pet</p>
								<p style={{ fontSize: "13px", color: "#1C1C1C", fontWeight: 500, marginTop: "2px" }}>{selected.petName}</p>
							</div>
							<div className="p-3 rounded-xl" style={{ background: "#F9F6F2" }}>
								<p style={{ fontSize: "10px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Shelter</p>
								<p style={{ fontSize: "13px", color: "#1C1C1C", fontWeight: 500, marginTop: "2px" }}>{selected.shelter}</p>
							</div>
						</div>

						{selected.status !== "removed" && (
							<div className="flex gap-3">
								{selected.status === "published" ? (
									<button onClick={() => setStatus(selected.id, "flagged")} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
										style={{ background: "#FAF0EE", color: "#C4857A" }}>
										<Flag className="size-4" /> Flag Review
									</button>
								) : (
									<button onClick={() => setStatus(selected.id, "published")} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
										style={{ background: "#E8F4F1", color: "#216959" }}>
										<CheckCircle2 className="size-4" /> Approve
									</button>
								)}
								<button onClick={() => remove(selected.id)} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
									style={{ background: "#F4F4F4", color: "#888" }}>
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
