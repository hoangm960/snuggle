const STATS = [
	["99+", "Pets Available"],
	["99+", "Matches Made"],
	["99+", "Animals Rescued"],
] as const;

export default function StatsBarSection() {
	return (
		<div
			className="flex flex-wrap items-center justify-center gap-0"
			style={{ background: "#2D6A5F" }}
		>
			{STATS.map(([num, label], i) => (
				<div
					key={label}
					className="flex items-center justify-center gap-3 py-7 px-10 sm:px-16"
					style={{
						borderRight:
							i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
						flex: "1 1 160px",
					}}
				>
					<span
						className="font-bold"
						style={{
							color: "#fff",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "28px",
						}}
					>
						{num}
					</span>
					<span
						style={{
							color: "rgba(255,255,255,0.75)",
							fontSize: "13px",
							fontFamily: "'Space Grotesk', sans-serif",
						}}
					>
						{label}
					</span>
				</div>
			))}
		</div>
	);
}
