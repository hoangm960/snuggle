"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";
import type { QuizQuestion } from "@/types";

interface QuizModalProps {
	open: boolean;
	onClose: () => void;
}

const SPECIES_EMOJI: Record<string, string> = {
	dog: "🐶",
	cat: "🐱",
	other: "🐾",
};

const SIZE_LABEL: Record<string, string> = {
	small: "Small",
	medium: "Medium",
	large: "Large",
};

function PawProgress({ current, total }: { current: number; total: number }) {
	const pct = total > 0 ? (current / total) * 100 : 0;
	return (
		<div className="w-full h-1.5 rounded-full" style={{ background: "#E8F4F1" }}>
			<div
				className="h-full rounded-full transition-all duration-500"
				style={{ width: `${pct}%`, background: "#7AADA1" }}
			/>
		</div>
	);
}

function OptionButton({
	option,
	selected,
	onClick,
}: {
	option: QuizQuestion["options"][0];
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="flex items-start gap-3 w-full text-left rounded-2xl p-4 border transition-all"
			style={{
				borderColor: selected ? "#7AADA1" : "#E8E8E8",
				background: selected ? "#E8F4F1" : "#FAFAFA",
				cursor: "pointer",
			}}
		>
			<span
				className="flex-shrink-0 size-9 rounded-xl flex items-center justify-center text-base"
				style={{
					background: selected ? "#7AADA1" : "#F0F0F0",
					color: selected ? "#fff" : "#666",
					transition: "background 0.15s, color 0.15s",
				}}
			>
				{option.icon}
			</span>
			<span className="flex-1 min-w-0">
				<span
					className="block text-sm font-semibold"
					style={{
						color: selected ? "#216959" : "#1C1C1C",
						fontFamily: "'Space Grotesk', sans-serif",
					}}
				>
					{option.label}
				</span>
				{option.subLabel && (
					<span className="block text-xs mt-0.5" style={{ color: "#888" }}>
						{option.subLabel}
					</span>
				)}
			</span>
			<span
				className="shrink-0 size-5 rounded-full border-2 flex items-center justify-center mt-0.5"
				style={{
					borderColor: selected ? "#7AADA1" : "#D0D0D0",
					background: selected ? "#7AADA1" : "transparent",
				}}
			>
				{selected && (
					<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
						<path
							d="M1 4L3.5 6.5L9 1"
							stroke="white"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</span>
		</button>
	);
}

export function QuizModal({ open, onClose }: QuizModalProps) {
	const { questions, loading, matching, matches, submitAnswers, reset } = useQuiz();
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	useEffect(() => {
		if (open) {
			setStep(0);
			setAnswers({});
			reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	if (!open) return null;

	const total = questions.length;
	const current = questions[step];
	const selectedValue = current ? answers[current.id!] : undefined;
	const isLast = step === total - 1;
	const canProceed = !!selectedValue;

	const handleSelect = (value: string) => {
		if (!current) return;
		setAnswers((prev) => ({ ...prev, [current.id!]: value }));
	};

	const handleNext = async () => {
		if (isLast) {
			await submitAnswers(answers);
		} else {
			setStep((s) => s + 1);
		}
	};

	const handleBack = () => {
		if (step > 0) setStep((s) => s - 1);
	};

	const handleRetake = () => {
		setStep(0);
		setAnswers({});
		reset();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="w-full max-w-lg rounded-3xl overflow-hidden"
				style={{
					background: "#fff",
					boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<div
					className="flex items-center justify-between px-6 pt-6 pb-4"
					style={{ borderBottom: "1px solid #F0F0F0" }}
				>
					<div>
						<h2
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "18px",
								fontWeight: 700,
								color: "#1C1C1C",
							}}
						>
							Find Your Perfect Pet
						</h2>
						{!matches && !loading && total > 0 && (
							<p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
								{step + 1} of {total} questions
							</p>
						)}
					</div>
					<button
						onClick={onClose}
						className="size-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
						style={{ background: "#F6F6F6" }}
					>
						<X className="size-4" style={{ color: "#888" }} />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					{/* Loading questions */}
					{loading && (
						<div className="flex flex-col items-center justify-center py-16 gap-3">
							<Loader2 className="size-8 animate-spin" style={{ color: "#7AADA1" }} />
							<p style={{ color: "#888", fontSize: "14px" }}>Loading questions…</p>
						</div>
					)}

					{/* No questions configured */}
					{!loading && total === 0 && !matches && (
						<div className="text-center py-16">
							<p style={{ fontSize: "32px", marginBottom: "12px" }}>🐾</p>
							<p
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "16px",
									fontWeight: 600,
									color: "#1C1C1C",
									marginBottom: "6px",
								}}
							>
								Quiz Coming Soon
							</p>
							<p style={{ fontSize: "13px", color: "#888" }}>
								Our team is setting up the quiz. Check back soon!
							</p>
						</div>
					)}

					{/* Quiz in progress */}
					{!loading && !matches && current && (
						<>
							<PawProgress current={step + 1} total={total} />
							<p
								className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2"
								style={{
									color: "#7AADA1",
									fontFamily: "'Space Grotesk', sans-serif",
								}}
							>
								{current.category}
							</p>
							<p
								className="mb-5"
								style={{
									fontFamily: "'Space Grotesk', sans-serif",
									fontSize: "17px",
									fontWeight: 600,
									color: "#1C1C1C",
									lineHeight: 1.4,
								}}
							>
								{current.question}
							</p>
							<div className="flex flex-col gap-3">
								{current.options.map((opt) => (
									<OptionButton
										key={opt.value}
										option={opt}
										selected={selectedValue === opt.value}
										onClick={() => handleSelect(opt.value)}
									/>
								))}
							</div>
						</>
					)}

					{/* Computing matches */}
					{matching && (
						<div className="flex flex-col items-center justify-center py-16 gap-3">
							<Loader2 className="size-8 animate-spin" style={{ color: "#7AADA1" }} />
							<p style={{ color: "#888", fontSize: "14px" }}>
								Finding your perfect match…
							</p>
						</div>
					)}

					{/* Results */}
					{matches && !matching && (
						<>
							<div className="text-center mb-6">
								<p style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</p>
								<p
									style={{
										fontFamily: "'Space Grotesk', sans-serif",
										fontSize: "18px",
										fontWeight: 700,
										color: "#1C1C1C",
										marginBottom: "4px",
									}}
								>
									Your Matches
								</p>
								<p style={{ fontSize: "13px", color: "#888" }}>
									Based on your lifestyle and preferences
								</p>
							</div>

							{matches.length === 0 ? (
								<div className="text-center py-8">
									<p style={{ fontSize: "13px", color: "#888" }}>
										No available pets match your profile right now. Check back
										soon!
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{matches.map((m, i) => (
										<div
											key={m.pet.id}
											className="flex items-center gap-4 rounded-2xl p-4"
											style={{
												border:
													i === 0
														? "1.5px solid #7AADA1"
														: "1px solid #F0F0F0",
												background: i === 0 ? "#E8F4F1" : "#FAFAFA",
											}}
										>
											{/* Thumbnail */}
											<div
												className="relative shrink-0 rounded-xl overflow-hidden"
												style={{
													width: "60px",
													height: "60px",
													background: "#F0F0F0",
												}}
											>
												{m.pet.thumbnail ? (
													<Image
														src={m.pet.thumbnail}
														alt={m.pet.name}
														fill
														className="object-cover"
														sizes="80px"
													/>
												) : (
													<div className="flex items-center justify-center h-full text-2xl">
														{SPECIES_EMOJI[m.pet.species] || "🐾"}
													</div>
												)}
											</div>

											{/* Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-0.5">
													<p
														style={{
															fontFamily:
																"'Space Grotesk', sans-serif",
															fontSize: "15px",
															fontWeight: 700,
															color: "#1C1C1C",
														}}
													>
														{m.pet.name}
													</p>
													{i === 0 && (
														<span
															className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
															style={{
																background: "#7AADA1",
																color: "#fff",
															}}
														>
															Best match
														</span>
													)}
												</div>
												<p style={{ fontSize: "12px", color: "#888" }}>
													{m.pet.breed} ·{" "}
													{SIZE_LABEL[m.pet.size] || m.pet.size} ·{" "}
													{m.pet.ageMonths} mo
												</p>
											</div>

											{/* Score + link */}
											<div className="shrink-0 text-right">
												<p
													style={{
														fontFamily: "'Space Grotesk', sans-serif",
														fontSize: "20px",
														fontWeight: 700,
														color: "#216959",
													}}
												>
													{m.pct}%
												</p>
												<Link
													href={`/pets/${m.pet.id}`}
													onClick={onClose}
													className="text-xs font-semibold hover:underline"
													style={{ color: "#7AADA1" }}
												>
													View →
												</Link>
											</div>
										</div>
									))}
								</div>
							)}

							<div className="flex gap-3 mt-6">
								<button
									onClick={handleRetake}
									className="flex-1 h-11 rounded-full border flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:bg-gray-50"
									style={{
										borderColor: "#E8E8E8",
										color: "#666",
										fontFamily: "'Space Grotesk', sans-serif",
									}}
								>
									<RefreshCw className="size-4" />
									Retake Quiz
								</button>
								<Link
									href="/pets"
									onClick={onClose}
									className="flex-1 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-opacity hover:opacity-90"
									style={{
										background: "#7AADA1",
										color: "#fff",
										fontFamily: "'Space Grotesk', sans-serif",
									}}
								>
									Browse All Pets
								</Link>
							</div>
						</>
					)}
				</div>

				{/* Footer nav (only while answering) */}
				{!loading && !matching && !matches && current && (
					<div
						className="px-6 py-4 flex items-center justify-between"
						style={{ borderTop: "1px solid #F0F0F0" }}
					>
						<button
							onClick={handleBack}
							disabled={step === 0}
							className="flex items-center gap-1.5 text-sm font-medium transition-opacity disabled:opacity-30"
							style={{
								color: "#666",
								fontFamily: "'Space Grotesk', sans-serif",
								background: "none",
								border: "none",
								cursor: step === 0 ? "default" : "pointer",
							}}
						>
							<ArrowLeft className="size-4" />
							Back
						</button>

						<button
							onClick={handleNext}
							disabled={!canProceed}
							className="flex items-center gap-2 h-10 px-6 rounded-full text-sm font-semibold transition-all"
							style={{
								background: canProceed ? "#7AADA1" : "#E0E0E0",
								color: canProceed ? "#fff" : "#aaa",
								border: "none",
								cursor: canProceed ? "pointer" : "default",
								fontFamily: "'Space Grotesk', sans-serif",
							}}
						>
							{isLast ? "See my matches" : "Next"}
							{!isLast && <ArrowRight className="size-4" />}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
