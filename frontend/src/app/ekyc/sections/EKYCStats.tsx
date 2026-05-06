const STATS = [
	["256K+", "Users Verified"],
	["99.9%", "Accuracy Rate"],
	["< 5 min", "Average Time"],
] as const;

export function EKYCStats() {
	return (
		<div
			className="flex flex-wrap items-center justify-center"
			style={{ background: "#216959" }}
		>
			{STATS.map(([num, label], i, arr) => (
				<div
					key={label}
					className="flex items-center justify-center gap-3 py-6 px-10 sm:px-16"
					style={{
						borderRight:
							i < arr.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
						flex: "1 1 160px",
					}}
				>
					<span
						className="font-bold"
						style={{
							color: "#fff",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "26px",
						}}
					>
						{num}
					</span>
					<span
						style={{
							color: "rgba(255,255,255,0.75)",
							fontSize: "12px",
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
