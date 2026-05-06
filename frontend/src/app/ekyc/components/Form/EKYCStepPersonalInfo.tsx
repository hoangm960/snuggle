import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

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
	const dateValue = parseDDMMYYYYToDate(formData.dateOfBirth);

	const handleDateOfBirthChange = (date: Date | null) => {
		if (date) {
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
				<div
					style={{
						border: "1px solid #E0E0E0",
						borderRadius: "12px",
						overflow: "hidden",
					}}
				>
					<DatePicker
						onChange={handleDateOfBirthChange}
						value={dateValue}
						format="dd/MM/yyyy"
						calendarIcon={null}
						clearIcon={null}
						showLeadingZeros
						maxDate={new Date()}
						className="w-full"
						style={{
							width: "100%",
							height: "44px",
							border: "none",
							outline: "none",
							fontFamily: "'Space Grotesk', sans-serif",
							fontSize: "13px",
							color: "#333",
							paddingLeft: "14px",
							paddingRight: "14px",
						}}
					/>
				</div>
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
