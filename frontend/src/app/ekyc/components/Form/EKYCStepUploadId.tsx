import { RefObject } from "react";
import Image from "next/image";
import { UploadIcon } from "@/assets/icons/ekyc-icons";

interface EKYCStepUploadIdProps {
	file: File | null;
	onFileSelect: (file: File) => void;
	inputRef: RefObject<HTMLInputElement>;
}

const ID_TYPES = [
	{ icon: "/images/ekyc/Icons.svg", label: "National ID Card", bg: "#E8F4F1" },
	{ icon: "/images/ekyc/Icons-3.svg", label: "Passport", bg: "#F9F6F2" },
	{ icon: "/images/ekyc/Icons-2.svg", label: "Driver's License", bg: "#FDF2F0" },
];

export function EKYCStepUploadId({ file, onFileSelect, inputRef }: EKYCStepUploadIdProps) {
	return (
		<div className="flex flex-col items-center gap-6">
			<div
				style={{
					display: "flex",
					gap: "20px",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{ID_TYPES.map((opt, i) => (
					<button
						key={i}
						type="button"
						style={{
							padding: "20px 24px",
							borderRadius: "16px",
							border: "2px solid #E0E0E0",
							background: opt.bg,
							cursor: "pointer",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "10px",
							minWidth: "130px",
							transition: "border-color 0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7AADA1")}
						onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E0E0E0")}
						onClick={() => inputRef.current?.click()}
					>
						<Image src={opt.icon} alt={opt.label} width={32} height={32} unoptimized />
						<span
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "12px",
								fontWeight: 600,
								color: "#333",
								textAlign: "center",
							}}
						>
							{opt.label}
						</span>
					</button>
				))}
			</div>

			<input
				type="file"
				ref={inputRef}
				accept="image/*,.pdf"
				style={{ display: "none" }}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) onFileSelect(file);
				}}
			/>

			<div
				style={{
					width: "100%",
					maxWidth: "480px",
					borderRadius: "16px",
					border: "2px dashed #C8DDD9",
					background: file ? "#E8F4F1" : "#fff",
					padding: "40px 24px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "12px",
					cursor: "pointer",
				}}
				onClick={() => inputRef.current?.click()}
			>
				<div
					style={{
						width: "56px",
						height: "56px",
						borderRadius: "50%",
						background: "#E8F4F1",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<UploadIcon className="w-6 h-6" style={{ color: "#7AADA1" }} />
				</div>
				{file ? (
					<>
						<span
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								color: "#216959",
							}}
						>
							{file.name}
						</span>
						<span
							style={{
								fontSize: "12px",
								color: "#7AADA1",
							}}
						>
							{(file.size / 1024 / 1024).toFixed(2)} MB — Click to change
						</span>
					</>
				) : (
					<>
						<span
							style={{
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "14px",
								fontWeight: 600,
								color: "#333",
							}}
						>
							Drop your file here
						</span>
						<span style={{ fontSize: "12px", color: "#888" }}>
							PNG, JPG or PDF — max 10 MB
						</span>
						<button
							type="button"
							style={{
								marginTop: "4px",
								padding: "8px 20px",
								borderRadius: "8px",
								background: "#7AADA1",
								color: "#fff",
								border: "none",
								cursor: "pointer",
								fontFamily: "'Space Grotesk', sans-serif",
								fontSize: "13px",
								fontWeight: 600,
							}}
						>
							Choose File
						</button>
					</>
				)}
			</div>
		</div>
	);
}
