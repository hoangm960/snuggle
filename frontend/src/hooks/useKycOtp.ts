import { useState, useCallback } from "react";

interface UseKycOtpReturn {
	loading: boolean;
	error: string | null;
	otpSent: boolean;
	sendOtp: () => Promise<void>;
	confirmOtp: (code: string) => Promise<void>;
	reset: () => void;
}

export function useKycOtp(): UseKycOtpReturn {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [otpSent, setOtpSent] = useState(false);

	const sendOtp = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { ekycApi } = await import("@/lib/ekycApi");
			await ekycApi.sendOtp();
			setOtpSent(true);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to send verification code";
			setError(message);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const confirmOtp = useCallback(async (code: string) => {
		setLoading(true);
		setError(null);
		try {
			const { ekycApi } = await import("@/lib/ekycApi");
			await ekycApi.verifyOtp(code);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Invalid verification code";
			setError(message);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const reset = useCallback(() => {
		setOtpSent(false);
		setError(null);
		setLoading(false);
	}, []);

	return { loading, error, otpSent, sendOtp, confirmOtp, reset };
}
