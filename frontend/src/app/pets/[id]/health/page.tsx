"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HeartPulse, CheckCircle2, PawPrint, Syringe, Stethoscope, Scissors, Smile } from "lucide-react";

const mockPetHealth: Record<string, { petName: string; species: string; records: HealthRecord[] }> = {
	p1: {
		petName: "Mochi",
		species: "cat",
		records: [
			{ id: "HR-001", type: "vaccination", title: "Rabies Vaccine", description: "Annual rabies vaccination completed.", veterinarian: "Dr. Sarah Lee", date: "Apr 20, 2026", nextDueDate: "Apr 20, 2027" },
			{ id: "HR-002", type: "checkup", title: "Annual Wellness Exam", description: "Full health checkup. All vitals normal, weight healthy.", veterinarian: "Dr. Sarah Lee", date: "Apr 20, 2026" },
			{ id: "HR-003", type: "vaccination", title: "FVRCP Vaccine", description: "Core feline combination vaccine.", veterinarian: "Dr. Sarah Lee", date: "Jan 15, 2026", nextDueDate: "Jan 15, 2027" },
		],
	},
};

interface HealthRecord {
	id: string;
	type: "vaccination" | "checkup" | "treatment" | "surgery" | "dental";
	title: string;
	description: string;
	veterinarian: string;
	date: string;
	nextDueDate?: string;
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
	vaccination: { label: "Vaccination", color: "#216959", bg: "#E8F4F1", icon: Syringe },
	checkup: { label: "Checkup", color: "#7AADA1", bg: "#F0F8F6", icon: Stethoscope },
	treatment: { label: "Treatment", color: "#C4857A", bg: "#FAF0EE", icon: HeartPulse },
	surgery: { label: "Surgery", color: "#9A7768", bg: "#F5EFEB", icon: Scissors },
	dental: { label: "Dental", color: "#666", bg: "#F4F4F4", icon: Smile },
};

export default function PetHealthPage() {
	const params = useParams();
	const petId = Array.isArray(params.id) ? params.id[0] : params.id;
	const data = mockPetHealth[petId] ?? null;

	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: "#F9F6F2" }}>
				<div className="text-center">
					<PawPrint className="size-12 mx-auto mb-3" style={{ color: "#E0E0E0" }} />
					<p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 600, color: "#333" }}>No health records found</p>
					<p style={{ fontSize: "14px", color: "#888", marginTop: "4px" }}>This pet doesn't have any health records yet.</p>
					<Link href="/pets" className="inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
						style={{ background: "linear-gradient(135deg, #7AADA1, #216959)" }}>
						Back to Pets
					</Link>
				</div>
			</div>
		);
	}

	const vaccinations = data.records.filter((r) => r.type === "vaccination");
	const other = data.records.filter((r) => r.type !== "vaccination");

	return (
		<div className="min-h-screen" style={{ background: "#F9F6F2", fontFamily: "'Poppins', sans-serif" }}>
			{/* Header */}
			<div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0" }}>
				<div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
					<Link href={`/pets/${petId}`} className="size-9 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
						style={{ border: "1px solid #E8E8E8" }}>
						<ArrowLeft className="size-4" style={{ color: "#888" }} />
					</Link>
					<div className="flex items-center gap-2">
						<div className="size-8 rounded-xl flex items-center justify-center" style={{ background: "#E8F4F1" }}>
							<HeartPulse className="size-4" style={{ color: "#7AADA1" }} />
						</div>
						<span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1C1C1C" }}>
							{data.petName}'s Health Records
						</span>
					</div>
				</div>
			</div>

			<div className="max-w-3xl mx-auto px-6 py-8">
				{/* Pet hero card */}
				<div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
					<PawPrint className="absolute -right-4 -bottom-4 size-28 opacity-10" />
					<p style={{ fontSize: "11px", opacity: 0.8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Health Summary</p>
					<p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px", fontWeight: 700, marginTop: "2px" }}>{data.petName}</p>
					<p style={{ fontSize: "13px", opacity: 0.85, marginTop: "2px", textTransform: "capitalize" }}>{data.species}</p>
					<div className="flex items-center gap-2 mt-4">
						<CheckCircle2 className="size-4" />
						<span style={{ fontSize: "13px" }}>{data.records.length} health records on file</span>
					</div>
				</div>

				{/* Vaccination status */}
				{vaccinations.length > 0 && (
					<div className="mb-6">
						<h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1C1C1C", marginBottom: "12px" }}>Vaccination Status</h2>
						<div className="grid gap-3">
							{vaccinations.map((r) => {
								const tc = typeConfig[r.type];
								return (
									<div key={r.id} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
										<div className="flex items-start gap-3">
											<div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tc.bg }}>
												<tc.icon className="size-4" style={{ color: tc.color }} />
											</div>
											<div className="flex-1">
												<div className="flex items-center justify-between">
													<p style={{ fontSize: "14px", fontWeight: 600, color: "#1C1C1C" }}>{r.title}</p>
													<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
												</div>
												<p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{r.description}</p>
												<div className="flex items-center gap-3 mt-2" style={{ fontSize: "11px", color: "#aaa" }}>
													<span>{r.veterinarian}</span>
													<span>·</span>
													<span>{r.date}</span>
													{r.nextDueDate && (
														<>
															<span>·</span>
															<span style={{ color: "#C4857A", fontWeight: 500 }}>Next: {r.nextDueDate}</span>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Other records */}
				{other.length > 0 && (
					<div>
						<h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1C1C1C", marginBottom: "12px" }}>Medical History</h2>
						<div className="grid gap-3">
							{other.map((r) => {
								const tc = typeConfig[r.type];
								return (
									<div key={r.id} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
										<div className="flex items-start gap-3">
											<div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tc.bg }}>
												<tc.icon className="size-4" style={{ color: tc.color }} />
											</div>
											<div className="flex-1">
												<div className="flex items-center justify-between">
													<p style={{ fontSize: "14px", fontWeight: 600, color: "#1C1C1C" }}>{r.title}</p>
													<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
												</div>
												<p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{r.description}</p>
												<div className="flex items-center gap-3 mt-2" style={{ fontSize: "11px", color: "#aaa" }}>
													<span>{r.veterinarian}</span>
													<span>·</span>
													<span>{r.date}</span>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				<div className="mt-8 text-center">
					<Link href={`/pets/${petId}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
						style={{ border: "1px solid #E8E8E8", color: "#666", background: "#fff" }}>
						<ArrowLeft className="size-4" /> Back to {data.petName}'s Profile
					</Link>
				</div>
			</div>
		</div>
	);
}
