"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import {
	Pencil,
	Trash2,
	ChevronUp,
	ChevronDown,
	Loader2,
	X,
	Save,
	ToggleLeft,
	ToggleRight,
	Plus,
	CheckSquare,
	Square,
	Check,
	Library,
} from "lucide-react";
import api from "@/lib/api";
import type { QuizQuestion, QuizOption } from "@/types";

type WeightKey = "dog" | "cat" | "other" | "small" | "medium" | "large";

// ─── Predefined templates ─────────────────────────────────────────────────────
const TEMPLATES: Omit<QuizQuestion, "id" | "createdAt" | "updatedAt">[] = [
	{
		order: 0, category: "Lifestyle", isActive: true,
		question: "How busy is your daily routine?",
		options: [
			{ value: "very-busy", label: "Very busy", subLabel: "Work long hours, rarely home", icon: "⚡", weights: { species: { dog: 0, cat: 3, other: 2 }, size: { small: 3, medium: 1, large: 0 } } },
			{ value: "moderately-busy", label: "Moderately busy", subLabel: "Work 9–5, free evenings", icon: "⏰", weights: { species: { dog: 2, cat: 3, other: 2 }, size: { small: 2, medium: 2, large: 1 } } },
			{ value: "flexible", label: "Flexible schedule", subLabel: "Work from home or part-time", icon: "☀️", weights: { species: { dog: 3, cat: 2, other: 2 }, size: { small: 2, medium: 3, large: 2 } } },
			{ value: "lots-of-time", label: "Lots of free time", subLabel: "Retired or student", icon: "🌿", weights: { species: { dog: 3, cat: 2, other: 1 }, size: { small: 1, medium: 2, large: 3 } } },
		],
	},
	{
		order: 1, category: "Living Space", isActive: true,
		question: "Where do you live?",
		options: [
			{ value: "small-apartment", label: "Small apartment", subLabel: "Under 40 m²", icon: "🏢", weights: { species: { dog: 1, cat: 3, other: 3 }, size: { small: 3, medium: 1, large: 0 } } },
			{ value: "large-apartment", label: "Large apartment", subLabel: "40–80 m² with balcony", icon: "🏙️", weights: { species: { dog: 2, cat: 3, other: 2 }, size: { small: 3, medium: 2, large: 1 } } },
			{ value: "house-no-yard", label: "House, no yard", subLabel: "Townhouse / row house", icon: "🏡", weights: { species: { dog: 2, cat: 2, other: 2 }, size: { small: 2, medium: 3, large: 2 } } },
			{ value: "house-with-yard", label: "House with yard", subLabel: "Outdoor space available", icon: "🌳", weights: { species: { dog: 3, cat: 2, other: 1 }, size: { small: 1, medium: 2, large: 3 } } },
		],
	},
	{
		order: 2, category: "Relationship", isActive: true,
		question: "What kind of bond do you want with your pet?",
		options: [
			{ value: "cuddly", label: "Cuddly companion", subLabel: "Loves to be held and petted", icon: "❤️", weights: { species: { dog: 3, cat: 3, other: 0 }, size: { small: 3, medium: 2, large: 1 } } },
			{ value: "playful", label: "Active playmate", subLabel: "Games, fetch, training tricks", icon: "🏃", weights: { species: { dog: 3, cat: 1, other: 1 }, size: { small: 1, medium: 2, large: 3 } } },
			{ value: "observe", label: "Observe & admire", subLabel: "Beautiful, low-touch pet", icon: "🌸", weights: { species: { dog: 0, cat: 1, other: 3 }, size: { small: 3, medium: 2, large: 1 } } },
			{ value: "chill", label: "Chill companion", subLabel: "Calm, peaceful presence", icon: "🌙", weights: { species: { dog: 1, cat: 3, other: 2 }, size: { small: 2, medium: 3, large: 2 } } },
		],
	},
	{
		order: 3, category: "Experience", isActive: true,
		question: "How experienced are you with pets?",
		options: [
			{ value: "first-time", label: "First-time owner", subLabel: "Completely new to having pets", icon: "🌱", weights: { species: { dog: 2, cat: 3, other: 1 }, size: { small: 3, medium: 2, large: 0 } } },
			{ value: "some-experience", label: "Some experience", subLabel: "Had a common pet before", icon: "⭐", weights: { species: { dog: 3, cat: 3, other: 2 }, size: { small: 2, medium: 3, large: 2 } } },
			{ value: "experienced", label: "Experienced", subLabel: "Owned multiple pets", icon: "🏆", weights: { species: { dog: 3, cat: 3, other: 3 }, size: { small: 1, medium: 2, large: 3 } } },
			{ value: "exotic", label: "Exotic enthusiast", subLabel: "Comfortable with unusual animals", icon: "🦎", weights: { species: { dog: 1, cat: 1, other: 3 }, size: { small: 2, medium: 2, large: 2 } } },
		],
	},
	{
		order: 4, category: "Household", isActive: true,
		question: "Who else lives with you?",
		options: [
			{ value: "alone", label: "Just me", subLabel: "Living solo", icon: "🙋", weights: { species: { dog: 2, cat: 3, other: 2 }, size: { small: 2, medium: 2, large: 2 } } },
			{ value: "partner", label: "Me & partner", subLabel: "Two adults", icon: "👫", weights: { species: { dog: 3, cat: 3, other: 2 }, size: { small: 2, medium: 3, large: 2 } } },
			{ value: "kids", label: "Kids at home", subLabel: "Young children present", icon: "👶", weights: { species: { dog: 3, cat: 2, other: 0 }, size: { small: 1, medium: 2, large: 3 } } },
			{ value: "other-pets", label: "Other pets", subLabel: "Dogs, cats, or others already", icon: "🐾", weights: { species: { dog: 2, cat: 2, other: 1 }, size: { small: 2, medium: 2, large: 2 } } },
		],
	},
	{
		order: 5, category: "Activity", isActive: true,
		question: "How active do you want your lifestyle with a pet to be?",
		options: [
			{ value: "very-active", label: "Very active", subLabel: "Daily runs, hikes, outdoor play", icon: "🏔️", weights: { species: { dog: 3, cat: 0, other: 0 }, size: { small: 0, medium: 1, large: 3 } } },
			{ value: "moderately-active", label: "Moderately active", subLabel: "Regular walks and play sessions", icon: "🚶", weights: { species: { dog: 3, cat: 1, other: 1 }, size: { small: 1, medium: 3, large: 2 } } },
			{ value: "occasionally-active", label: "Occasionally active", subLabel: "Short walks, indoor play", icon: "🛋️", weights: { species: { dog: 1, cat: 3, other: 2 }, size: { small: 3, medium: 2, large: 1 } } },
			{ value: "low-activity", label: "Low activity", subLabel: "Minimal exercise required", icon: "😌", weights: { species: { dog: 0, cat: 3, other: 3 }, size: { small: 3, medium: 2, large: 0 } } },
		],
	},
	{
		order: 6, category: "Budget", isActive: true,
		question: "What's your monthly budget for pet care?",
		options: [
			{ value: "budget-conscious", label: "Budget-conscious", subLabel: "Under $50/month", icon: "💰", weights: { species: { dog: 0, cat: 2, other: 3 }, size: { small: 3, medium: 1, large: 0 } } },
			{ value: "moderate-budget", label: "Moderate", subLabel: "$50–$150/month", icon: "💳", weights: { species: { dog: 2, cat: 3, other: 2 }, size: { small: 2, medium: 3, large: 1 } } },
			{ value: "comfortable", label: "Comfortable", subLabel: "$150–$300/month", icon: "💵", weights: { species: { dog: 3, cat: 3, other: 2 }, size: { small: 1, medium: 2, large: 3 } } },
			{ value: "flexible-budget", label: "No concerns", subLabel: "Budget is flexible", icon: "🏦", weights: { species: { dog: 3, cat: 3, other: 3 }, size: { small: 1, medium: 2, large: 3 } } },
		],
	},
];

const emptyOption = (): QuizOption => ({
	value: "",
	label: "",
	subLabel: "",
	icon: "🐾",
	weights: { species: { dog: 1, cat: 1, other: 1 }, size: { small: 1, medium: 1, large: 1 } },
});

const emptyQuestion = (): Omit<QuizQuestion, "id" | "createdAt" | "updatedAt"> => ({
	order: 0,
	category: "",
	question: "",
	options: [emptyOption(), emptyOption()],
	isActive: true,
});

function OptionEditor({
	opt,
	i,
	canRemove,
	onChange,
	onWeight,
	onRemove,
}: {
	opt: QuizOption;
	i: number;
	canRemove: boolean;
	onChange: (i: number, field: keyof QuizOption, v: string) => void;
	onWeight: (i: number, g: "species" | "size", k: WeightKey, v: number) => void;
	onRemove: (i: number) => void;
}) {
	return (
		<div className="rounded-2xl border border-border p-4 bg-secondary/30">
			<div className="flex items-start gap-2 mb-3">
				<input
					value={opt.icon}
					onChange={(e) => onChange(i, "icon", e.target.value)}
					className="w-11 h-9 text-center text-lg rounded-xl border border-input bg-background outline-none shrink-0"
					maxLength={4}
				/>
				<div className="flex-1 grid grid-cols-2 gap-2">
					<input
						value={opt.label}
						onChange={(e) => onChange(i, "label", e.target.value)}
						placeholder="Label"
						className="h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
					/>
					<input
						value={opt.subLabel || ""}
						onChange={(e) => onChange(i, "subLabel", e.target.value)}
						placeholder="Sub-label (optional)"
						className="h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<input
					value={opt.value}
					onChange={(e) => onChange(i, "value", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
					placeholder="key"
					className="w-28 h-9 rounded-xl border border-input bg-background px-3 text-xs font-mono outline-none focus:ring-1 focus:ring-ring shrink-0"
				/>
				{canRemove && (
					<button
						onClick={() => onRemove(i)}
						className="size-9 rounded-xl flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0"
					>
						<X className="size-3.5 text-destructive" />
					</button>
				)}
			</div>
			<div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
				{(["species", "size"] as const).map((group) => (
					<div key={group}>
						<p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
							{group === "species" ? "Species (0–3)" : "Size (0–3)"}
						</p>
						{(group === "species"
							? (["dog", "cat", "other"] as const)
							: (["small", "medium", "large"] as const)
						).map((k) => (
							<div key={k} className="flex items-center justify-between mb-1.5">
								<span className="text-xs capitalize text-foreground">{k}</span>
								<input
									type="number" min={0} max={3}
									value={(group === "species" ? opt.weights.species?.[k as "dog"|"cat"|"other"] : opt.weights.size?.[k as "small"|"medium"|"large"]) ?? 1}
									onChange={(e) => onWeight(i, group, k as WeightKey, parseInt(e.target.value) || 0)}
									className="w-14 h-7 text-center rounded-lg border border-input bg-background text-xs outline-none"
								/>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default function AdminQuizPage() {
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Select mode (multi-select for bulk delete)
	const [selectMode, setSelectMode] = useState(false);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [bulkDeleting, setBulkDeleting] = useState(false);

	// Create modal
	const [createOpen, setCreateOpen] = useState(false);
	const [createForm, setCreateForm] = useState(emptyQuestion());
	const [creating, setCreating] = useState(false);

	// Edit modal
	const [editForm, setEditForm] = useState<QuizQuestion | null>(null);
	const [saving, setSaving] = useState(false);

	// Single delete
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	// Library modal
	const [libraryOpen, setLibraryOpen] = useState(false);
	const [addingIdx, setAddingIdx] = useState<number | null>(null);

	useEffect(() => { fetchQuestions(); }, []);

	const fetchQuestions = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/admin/quiz");
			setQuestions(res.data.data || []);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load questions");
		} finally {
			setLoading(false);
		}
	};

	// ── Select mode ────────────────────────────────────────────────────────────

	const toggleSelectMode = () => {
		setSelectMode((v) => !v);
		setSelected(new Set());
	};

	const toggleSelected = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (selected.size === questions.length) {
			setSelected(new Set());
		} else {
			setSelected(new Set(questions.map((q) => q.id!)));
		}
	};

	const handleBulkDelete = async () => {
		setBulkDeleting(true);
		try {
			await Promise.all(Array.from(selected).map((id) => api.delete(`/admin/quiz/${id}`)));
			setQuestions((prev) => prev.filter((q) => !selected.has(q.id!)));
			setSelected(new Set());
			setSelectMode(false);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to delete");
		} finally {
			setBulkDeleting(false);
		}
	};

	// ── Create ─────────────────────────────────────────────────────────────────

	const openCreate = () => {
		setCreateForm({ ...emptyQuestion(), order: questions.length });
		setCreateOpen(true);
	};

	const handleCreate = async () => {
		if (!createForm.category.trim() || !createForm.question.trim()) return;
		setCreating(true);
		try {
			const res = await api.post("/admin/quiz", createForm);
			setQuestions((prev) => [...prev, res.data.data]);
			setCreateOpen(false);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to create question");
		} finally {
			setCreating(false);
		}
	};

	const addCreateOption = () =>
		setCreateForm((p) => ({ ...p, options: [...p.options, emptyOption()] }));
	const removeCreateOption = (i: number) =>
		setCreateForm((p) => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));
	const updateCreateOption = (i: number, field: keyof QuizOption, value: string) =>
		setCreateForm((p) => {
			const opts = [...p.options];
			opts[i] = { ...opts[i], [field]: value };
			return { ...p, options: opts };
		});
	const updateCreateWeight = (i: number, group: "species" | "size", key: WeightKey, val: number) =>
		setCreateForm((p) => {
			const opts = [...p.options];
			const w = { ...opts[i].weights };
			if (group === "species") w.species = { ...w.species, [key]: Math.max(0, Math.min(3, val)) };
			else w.size = { ...w.size, [key]: Math.max(0, Math.min(3, val)) };
			opts[i] = { ...opts[i], weights: w };
			return { ...p, options: opts };
		});

	// ── Edit ───────────────────────────────────────────────────────────────────

	const openEdit = (q: QuizQuestion) => setEditForm(JSON.parse(JSON.stringify(q)));

	const handleSaveEdit = async () => {
		if (!editForm) return;
		setSaving(true);
		try {
			const res = await api.put(`/admin/quiz/${editForm.id}`, editForm);
			setQuestions((prev) => prev.map((q) => (q.id === editForm.id ? res.data.data : q)));
			setEditForm(null);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to save");
		} finally {
			setSaving(false);
		}
	};

	const updateEditOption = (i: number, field: keyof QuizOption, value: string) =>
		setEditForm((p) => {
			if (!p) return p;
			const opts = [...p.options];
			opts[i] = { ...opts[i], [field]: value };
			return { ...p, options: opts };
		});
	const updateEditWeight = (i: number, group: "species" | "size", key: WeightKey, val: number) =>
		setEditForm((p) => {
			if (!p) return p;
			const opts = [...p.options];
			const w = { ...opts[i].weights };
			if (group === "species") w.species = { ...w.species, [key]: Math.max(0, Math.min(3, val)) };
			else w.size = { ...w.size, [key]: Math.max(0, Math.min(3, val)) };
			opts[i] = { ...opts[i], weights: w };
			return { ...p, options: opts };
		});

	// ── Single delete ──────────────────────────────────────────────────────────

	const handleDelete = async (id: string) => {
		try {
			await api.delete(`/admin/quiz/${id}`);
			setQuestions((prev) => prev.filter((q) => q.id !== id));
		} catch { /* ignore */ } finally {
			setDeleteConfirm(null);
		}
	};

	// ── Reorder ────────────────────────────────────────────────────────────────

	const moveQuestion = async (id: string, dir: -1 | 1) => {
		const idx = questions.findIndex((q) => q.id === id);
		if (idx < 0) return;
		const newIdx = idx + dir;
		if (newIdx < 0 || newIdx >= questions.length) return;
		const reordered = [...questions];
		[reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
		const updated = reordered.map((q, i) => ({ ...q, order: i }));
		setQuestions(updated);
		await Promise.all([
			api.put(`/admin/quiz/${updated[idx].id}`, { order: updated[idx].order }),
			api.put(`/admin/quiz/${updated[newIdx].id}`, { order: updated[newIdx].order }),
		]).catch(() => {});
	};

	const handleToggleActive = async (q: QuizQuestion) => {
		try {
			const res = await api.put(`/admin/quiz/${q.id}`, { isActive: !q.isActive });
			setQuestions((prev) => prev.map((item) => (item.id === q.id ? res.data.data : item)));
		} catch { /* ignore */ }
	};

	// ── Library ────────────────────────────────────────────────────────────────

	const isTemplateAdded = (tpl: (typeof TEMPLATES)[number]) =>
		questions.some((q) => q.category === tpl.category && q.question === tpl.question);

	const handleAddTemplate = async (idx: number) => {
		setAddingIdx(idx);
		const tpl = TEMPLATES[idx];
		try {
			const res = await api.post("/admin/quiz", { ...tpl, order: questions.length });
			setQuestions((prev) => [...prev, res.data.data]);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to add template");
		} finally {
			setAddingIdx(null);
		}
	};

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<AdminLayout title="Pet Quiz" subtitle="Build and manage the pet compatibility quiz.">

			{/* ── Top bar ── */}
			<div className="flex items-center justify-between mb-6">
				<p className="text-xs text-muted-foreground">
					{questions.length} question{questions.length !== 1 ? "s" : ""}
				</p>
				{selectMode ? (
					<div className="flex items-center gap-2">
						<button
							onClick={toggleSelectAll}
							className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
						>
							{selected.size === questions.length ? "Deselect all" : "Select all"}
						</button>
						{selected.size > 0 && (
							<button
								onClick={handleBulkDelete}
								disabled={bulkDeleting}
								className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
							>
								{bulkDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
								Delete {selected.size}
							</button>
						)}
						<button
							onClick={toggleSelectMode}
							className="h-9 px-4 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={toggleSelectMode}
						className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors"
					>
						<CheckSquare className="size-3.5" />
						Select
					</button>
				)}
			</div>

			{/* Error banner */}
			{error && (
				<div className="mb-4 px-4 py-3 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center justify-between">
					<span>{error}</span>
					<button onClick={() => setError(null)}><X className="size-4" /></button>
				</div>
			)}

			{/* ── Question list ── */}
			{loading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<div className="space-y-3">
						{questions.map((q, idx) => {
							const isSelected = selected.has(q.id!);
							return (
								<div
									key={q.id}
									onClick={() => selectMode && toggleSelected(q.id!)}
									className="bg-card border rounded-2xl p-5 flex items-start gap-4 shadow-card transition-colors"
									style={{
										borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
										background: isSelected ? "hsl(var(--primary) / 0.04)" : undefined,
										cursor: selectMode ? "pointer" : "default",
									}}
								>
									{/* Checkbox (select mode) or order controls */}
									{selectMode ? (
										<div className="pt-0.5 shrink-0">
											{isSelected
												? <CheckSquare className="size-5 text-primary" />
												: <Square className="size-5 text-muted-foreground" />}
										</div>
									) : (
										<div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
											<button
												onClick={() => moveQuestion(q.id!, -1)}
												disabled={idx === 0}
												className="size-7 rounded-lg flex items-center justify-center bg-secondary hover:bg-muted transition-colors disabled:opacity-30"
											>
												<ChevronUp className="size-3.5" />
											</button>
											<span className="text-xs font-mono text-muted-foreground">{idx + 1}</span>
											<button
												onClick={() => moveQuestion(q.id!, 1)}
												disabled={idx === questions.length - 1}
												className="size-7 rounded-lg flex items-center justify-center bg-secondary hover:bg-muted transition-colors disabled:opacity-30"
											>
												<ChevronDown className="size-3.5" />
											</button>
										</div>
									)}

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-[10px] font-bold uppercase tracking-widest text-primary">
												{q.category}
											</span>
											<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${q.isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
												{q.isActive ? "Active" : "Inactive"}
											</span>
										</div>
										<p className="text-sm font-semibold text-foreground mb-3">{q.question}</p>
										<div className="flex flex-wrap gap-2">
											{q.options.map((opt) => (
												<span key={opt.value} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium">
													{opt.icon} {opt.label}
												</span>
											))}
										</div>
									</div>

									{/* Row actions (hidden in select mode) */}
									{!selectMode && (
										<div className="flex items-center gap-1 shrink-0">
											<button onClick={() => handleToggleActive(q)} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title={q.isActive ? "Deactivate" : "Activate"}>
												{q.isActive ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4 text-muted-foreground" />}
											</button>
											<button onClick={() => openEdit(q)} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
												<Pencil className="size-3.5 text-muted-foreground" />
											</button>
											<button onClick={() => setDeleteConfirm(q.id!)} className="size-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors">
												<Trash2 className="size-3.5 text-destructive" />
											</button>
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* ── Create Question card ── */}
					{!selectMode && (
						<>
							<button
								onClick={openCreate}
								className="w-full mt-4 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
							>
								<div className="size-10 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-primary/5 transition-colors">
									<Plus className="size-5" />
								</div>
								<span className="text-sm font-semibold">Create Question</span>
								<span className="text-xs opacity-70">Add a custom question to the quiz</span>
							</button>
							<div className="mt-3 flex justify-center">
								<button
									onClick={() => setLibraryOpen(true)}
									className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
								>
									<Library className="size-3.5" />
									Or import from library
								</button>
							</div>
						</>
					)}
				</>
			)}

			{/* ════════════ Create Modal ════════════ */}
			{createOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
					<div className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-xl overflow-hidden" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
						<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
							<h3 className="font-display text-base font-semibold">Create Question</h3>
							<button onClick={() => setCreateOpen(false)} className="size-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
								<X className="size-4" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold text-muted-foreground mb-1.5">Category</label>
									<input value={createForm.category} onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Lifestyle" className="w-full h-10 rounded-xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
								</div>
								<div className="flex items-end pb-0.5">
									<label className="flex items-center gap-2 cursor-pointer">
										<span className="text-xs font-semibold text-muted-foreground">Active</span>
										<button onClick={() => setCreateForm((p) => ({ ...p, isActive: !p.isActive }))}>
											{createForm.isActive ? <ToggleRight className="size-6 text-success" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
										</button>
									</label>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold text-muted-foreground mb-1.5">Question</label>
								<input value={createForm.question} onChange={(e) => setCreateForm((p) => ({ ...p, question: e.target.value }))} placeholder="e.g. How busy is your daily routine?" className="w-full h-10 rounded-xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
							</div>

							<div>
								<div className="flex items-center justify-between mb-3">
									<label className="text-xs font-semibold text-muted-foreground">Options ({createForm.options.length})</label>
									<button onClick={addCreateOption} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
										<Plus className="size-3" /> Add option
									</button>
								</div>
								<div className="space-y-3">
									{createForm.options.map((opt, i) => (
										<OptionEditor key={i} opt={opt} i={i} canRemove={createForm.options.length > 2} onChange={updateCreateOption} onWeight={updateCreateWeight} onRemove={removeCreateOption} />
									))}
								</div>
							</div>
						</div>

						<div className="px-6 py-4 border-t border-border flex justify-end gap-3">
							<button onClick={() => setCreateOpen(false)} className="h-10 px-5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancel</button>
							<button onClick={handleCreate} disabled={creating || !createForm.category.trim() || !createForm.question.trim()} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
								{creating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
								Create
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ════════════ Edit Modal ════════════ */}
			{editForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setEditForm(null)}>
					<div className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-xl overflow-hidden" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
						<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
							<div>
								<h3 className="font-display text-base font-semibold">Edit Question</h3>
								<p className="text-xs text-muted-foreground mt-0.5">{editForm.category}</p>
							</div>
							<div className="flex items-center gap-3">
								<label className="flex items-center gap-1.5 cursor-pointer">
									<span className="text-xs text-muted-foreground">Active</span>
									<button onClick={() => setEditForm((p) => p ? { ...p, isActive: !p.isActive } : p)}>
										{editForm.isActive ? <ToggleRight className="size-5 text-success" /> : <ToggleLeft className="size-5 text-muted-foreground" />}
									</button>
								</label>
								<button onClick={() => setEditForm(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
									<X className="size-4" />
								</button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
							<div>
								<label className="block text-xs font-semibold text-muted-foreground mb-1.5">Question</label>
								<input value={editForm.question} onChange={(e) => setEditForm((p) => p ? { ...p, question: e.target.value } : p)} className="w-full h-10 rounded-xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
							</div>
							<div>
								<p className="text-xs font-semibold text-muted-foreground mb-3">Options & Weights <span className="font-normal opacity-70">(0 = avoid · 3 = strongly prefer)</span></p>
								<div className="space-y-3">
									{editForm.options.map((opt, i) => (
										<OptionEditor key={i} opt={opt} i={i} canRemove={editForm.options.length > 2}
											onChange={updateEditOption}
											onWeight={updateEditWeight}
											onRemove={(idx) => setEditForm((p) => p ? { ...p, options: p.options.filter((_, j) => j !== idx) } : p)}
										/>
									))}
								</div>
								<button onClick={() => setEditForm((p) => p ? { ...p, options: [...p.options, emptyOption()] } : p)} className="mt-3 text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
									<Plus className="size-3" /> Add option
								</button>
							</div>
						</div>

						<div className="px-6 py-4 border-t border-border flex justify-end gap-3">
							<button onClick={() => setEditForm(null)} className="h-10 px-5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancel</button>
							<button onClick={handleSaveEdit} disabled={saving} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
								{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ════════════ Library Modal ════════════ */}
			{libraryOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setLibraryOpen(false)}>
					<div className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-xl overflow-hidden" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
						<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
							<div>
								<h3 className="font-display text-base font-semibold">Question Library</h3>
								<p className="text-xs text-muted-foreground mt-0.5">Add predefined questions to your quiz</p>
							</div>
							<button onClick={() => setLibraryOpen(false)} className="size-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
								<X className="size-4" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
							{TEMPLATES.map((tpl, idx) => {
								const added = isTemplateAdded(tpl);
								const isAdding = addingIdx === idx;
								return (
									<div key={idx} className="rounded-2xl border border-border p-4 flex items-start gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-[10px] font-bold uppercase tracking-widest text-primary">{tpl.category}</span>
											</div>
											<p className="text-sm font-semibold text-foreground mb-2">{tpl.question}</p>
											<div className="flex flex-wrap gap-1.5">
												{tpl.options.map((opt) => (
													<span key={opt.value} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-secondary text-xs font-medium">
														{opt.icon} {opt.label}
													</span>
												))}
											</div>
										</div>
										<div className="shrink-0 pt-0.5">
											{added ? (
												<span className="flex items-center gap-1 text-xs font-semibold text-success">
													<Check className="size-3.5" /> Added
												</span>
											) : (
												<button
													onClick={() => handleAddTemplate(idx)}
													disabled={isAdding}
													className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50"
												>
													{isAdding ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
													Add
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>

						<div className="px-6 py-4 border-t border-border flex justify-end">
							<button onClick={() => setLibraryOpen(false)} className="h-10 px-5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary">Close</button>
						</div>
					</div>
				</div>
			)}

			{/* ════════════ Single delete confirm ════════════ */}
			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
					<div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
						<h4 className="font-display font-semibold mb-2">Delete this question?</h4>
						<p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-full bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90">Delete</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
