import { RefObject } from "react";
import Image from "next/image";
import { UploadIcon } from "@/assets/icons/ekyc-icons";

interface EKYCStepFinancialProps {
	file: File | null;
	onFileSelect: (file: File) => void;
	inputRef: RefObject<HTMLInputElement>;
}

export function EKYCStepFinancial({ file, onFileSelect, inputRef }: EKYCStepFinancialProps) {
	return (
		<div className="flex flex-col items-center gap-6">
			<div style={{ textAlign: "center" }}>
				<div
					style={{
						width: "64px",
						height: "64px",
						borderRadius: "50%",
						background: "#E8F4F1",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 16px",
					}}
				>
					<Image
						src="/images/ekyc/Icons-2.svg"
						alt="Financial"
						width={32}
						height={32}
						unoptimized
					/>
				</div>
				<p
					style={{
						color: "#666",
						fontSize: "14px",
						maxWidth: "380px",
						lineHeight: "1.7",
						margin: "0 auto",
					}}
				>
					Upload a recent bank statement, utility bill, or pay slip (within the last 3
					months) as proof of address and financial stability.
				</p>
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
							Upload Financial Document
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
