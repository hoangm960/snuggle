"use client";

import { useState, useRef, RefObject } from "react";
import { useKycOtp } from "@/hooks/useKycOtp";
import { ekycApi } from "@/lib/ekycApi";
import { EKYCFormStepper } from "./EKYCFormStepper";
import { EKYCStepPersonalInfo } from "./EKYCStepPersonalInfo";
import { EKYCStepUploadId } from "./EKYCStepUploadId";
import { EKYCStepFinancial } from "./EKYCStepFinancial";
import { EKYCStepConfirm } from "./EKYCStepConfirm";
import { EKYCFormNavigation } from "./EKYCFormNavigation";
import { EKYCFormError } from "./EKYCFormError";

interface FormData {
	fullName: string;
	dateOfBirth: string;
	idNumber: string;
	phone: string;
}

interface EKYCFormProps {
	onSuccess: () => void;
}

export function EKYCForm({ onSuccess }: EKYCFormProps) {
	const [activeStep, setActiveStep] = useState(0);
	const [formData, setFormData] = useState<FormData>({
		fullName: "",
		dateOfBirth: "",
		idNumber: "",
		phone: "",
	});

	const [idFile, setIdFile] = useState<File | null>(null);
	const [financialFile, setFinancialFile] = useState<File | null>(null);
	const [idDocumentURL, setIdDocumentURL] = useState("");
	const [financialDocumentURL, setFinancialDocumentURL] = useState("");

	const [otpCode, setOtpCode] = useState("");
	const [otpVerified, setOtpVerified] = useState(false);

	const [submitting, setSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		sendOtp,
		confirmOtp,
		loading: otpLoading,
		error: otpError,
		otpSent,
		reset: resetOtp,
	} = useKycOtp();

	const idInputRef = useRef<HTMLInputElement>(null);
	const financialInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (type: "id" | "financial", file: File) => {
		if (type === "id") {
			setIdFile(file);
		} else {
			setFinancialFile(file);
		}
	};

	const handleStepNext = async () => {
		setError(null);

		if (activeStep === 0) {
			const { fullName, dateOfBirth, idNumber, phone } = formData;
			if (!fullName || !dateOfBirth || !idNumber || !phone) {
				setError("Please fill in all fields");
				return;
			}
			setActiveStep(1);
		} else if (activeStep === 1) {
			if (!idFile) {
				setError("Please upload your ID document");
				return;
			}
			setUploading(true);
			try {
				const url = await ekycApi.uploadFile(idFile, "id");
				setIdDocumentURL(url);
				setActiveStep(2);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to upload ID document");
			} finally {
				setUploading(false);
			}
		} else if (activeStep === 2) {
			if (!financialFile) {
				setError("Please upload your financial document");
				return;
			}
			setUploading(true);
			try {
				const url = await ekycApi.uploadFile(financialFile, "financial");
				setFinancialDocumentURL(url);
				setActiveStep(3);
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Failed to upload financial document"
				);
			} finally {
				setUploading(false);
			}
		}
	};

	const handleSendOtp = async () => {
		setError(null);
		try {
			await sendOtp();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to send verification code");
		}
	};

	const handleSubmit = async () => {
		setError(null);
		setSubmitting(true);

		try {
			if (!otpVerified) {
				await confirmOtp(otpCode);
				setOtpVerified(true);
			}

			await ekycApi.submitKyc({
				fullName: formData.fullName,
				dateOfBirth: formData.dateOfBirth,
				idNumber: formData.idNumber,
				phone: formData.phone,
				idDocumentURL,
				financialDocumentURL,
			});

			onSuccess();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to submit verification");
		} finally {
			setSubmitting(false);
		}
	};

	const handleBack = () => {
		setError(null);
		setActiveStep((s) => Math.max(0, s - 1));
	};

	return (
		<div>
			<EKYCFormStepper activeStep={activeStep} onStepClick={setActiveStep} />

			<div
				style={{
					background: "#F9F6F2",
					borderRadius: "24px",
					padding: "40px",
				}}
			>
				{activeStep === 0 && (
					<EKYCStepPersonalInfo formData={formData} onChange={setFormData} />
				)}

				{activeStep === 1 && (
					<EKYCStepUploadId
						file={idFile}
						onFileSelect={(file) => handleFileSelect("id", file)}
						inputRef={idInputRef}
					/>
				)}

				{activeStep === 2 && (
					<EKYCStepFinancial
						file={financialFile}
						onFileSelect={(file) => handleFileSelect("financial", file)}
						inputRef={financialInputRef}
					/>
				)}

				{activeStep === 3 && (
					<EKYCStepConfirm
						formData={formData}
						idFile={idFile}
						financialFile={financialFile}
						otpCode={otpCode}
						otpVerified={otpVerified}
						otpSent={otpSent}
						otpLoading={otpLoading}
						onOtpCodeChange={setOtpCode}
						onSendOtp={handleSendOtp}
					/>
				)}

				{(error || otpError) && <EKYCFormError error={error} otpError={otpError} />}

				<EKYCFormNavigation
					activeStep={activeStep}
					uploading={uploading}
					submitting={submitting}
					otpSent={otpSent}
					onBack={handleBack}
					onNext={handleStepNext}
					onSubmit={handleSubmit}
				/>
			</div>
		</div>
	);
}
