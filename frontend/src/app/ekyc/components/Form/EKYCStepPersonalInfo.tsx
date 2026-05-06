interface FormData {
	fullName: string;
	dateOfBirth: string;
	idNumber: string;
	phone: string;
}

interface EKYCStepPersonalInfoProps {
	formData: FormData;
	onChange: (data: FormData) => void;
}

const formatDateToDDMMYYYY = (date: Date): string => {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

const parseDDMMYYYYToDate = (dateStr: string): Date | null => {
	const parts = dateStr.split("/");
	if (parts.length !== 3) return null;
	const day = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1;
	const year = parseInt(parts[2], 10);
	if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
	const date = new Date(year, month, day);
	if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day)
		return null;
	return date;
};

export function EKYCStepPersonalInfo({ formData, onChange }: EKYCStepPersonalInfoProps) {
	const dateValue = formData.dateOfBirth
		? parseDDMMYYYYToDate(formData.dateOfBirth)?.toISOString().split("T")[0] || ""
		: "";

	const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			const date = new Date(value + "T00:00:00");
			onChange({ ...formData, dateOfBirth: formatDateToDDMMYYYY(date) });
		} else {
			onChange({ ...formData, dateOfBirth: "" });
		}
	};

	const handleChange = (field: keyof FormData, value: string) => {
		onChange({ ...formData, [field]: value });
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
			<div>
				<label
					className="block font-medium mb-2"
					style={{
						color: "#333",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					Full Legal Name
				</label>
				<input
					type="text"
					placeholder="As on your ID document"
					value={formData.fullName}
					onChange={(e) => handleChange("fullName", e.target.value)}
					className="w-full h-11 rounded-xl outline-none"
					style={{
						paddingLeft: "14px",
						paddingRight: "14px",
						border: "1px solid #E0E0E0",
						background: "#fff",
						fontSize: "13px",
						color: "#333",
					}}
				/>
			</div>
			<div>
				<label
					className="block font-medium mb-2"
					style={{
						color: "#333",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					Date of Birth
				</label>
				<input
					type="date"
					value={dateValue}
					onChange={handleDateOfBirthChange}
					max={new Date().toISOString().split("T")[0]}
					className="w-full h-11 rounded-xl outline-none"
					style={{
						paddingLeft: "14px",
						paddingRight: "14px",
						border: "1px solid #E0E0E0",
						background: "#fff",
						fontSize: "13px",
						color: "#333",
					}}
				/>
			</div>
			<div>
				<label
					className="block font-medium mb-2"
					style={{
						color: "#333",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					National ID / Passport No.
				</label>
				<input
					type="text"
					placeholder="e.g. AB1234567"
					value={formData.idNumber}
					onChange={(e) => handleChange("idNumber", e.target.value)}
					className="w-full h-11 rounded-xl outline-none"
					style={{
						paddingLeft: "14px",
						paddingRight: "14px",
						border: "1px solid #E0E0E0",
						background: "#fff",
						fontSize: "13px",
						color: "#333",
					}}
				/>
			</div>
			<div>
				<label
					className="block font-medium mb-2"
					style={{
						color: "#333",
						fontFamily: "'Space Grotesk', sans-serif",
						fontSize: "13px",
					}}
				>
					Phone Number
				</label>
				<input
					type="tel"
					placeholder="+1 555 000 0000"
					value={formData.phone}
					onChange={(e) => handleChange("phone", e.target.value)}
					className="w-full h-11 rounded-xl outline-none"
					style={{
						paddingLeft: "14px",
						paddingRight: "14px",
						border: "1px solid #E0E0E0",
						background: "#fff",
						fontSize: "13px",
						color: "#333",
					}}
				/>
			</div>
		</div>
	);
}
