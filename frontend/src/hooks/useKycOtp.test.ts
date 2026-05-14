import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useKycOtp } from "./useKycOtp";

vi.mock("@/lib/ekycApi", () => ({
	ekycApi: {
		sendOtp: vi.fn(),
		verifyOtp: vi.fn(),
	},
}));

describe("useKycOtp", () => {
	let ekycApiModule: typeof import("@/lib/ekycApi");

	beforeEach(async () => {
		vi.resetModules();
		ekycApiModule = await import("@/lib/ekycApi");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should have initial state", () => {
		const { result } = renderHook(() => useKycOtp());

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.otpSent).toBe(false);
	});

	it("should set loading true during sendOtp", async () => {
		ekycApiModule.ekycApi.sendOtp = vi.fn(
			() => new Promise((resolve) => setTimeout(resolve, 100))
		);

		const { result } = renderHook(() => useKycOtp());

		act(() => {
			result.current.sendOtp();
		});

		expect(result.current.loading).toBe(true);
	});

	it("should set otpSent true after successful sendOtp", async () => {
		ekycApiModule.ekycApi.sendOtp = vi.fn().mockResolvedValue(undefined);

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			await result.current.sendOtp();
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.otpSent).toBe(true);
		expect(result.current.error).toBeNull();
	});

	it("should set error and rethrow on sendOtp failure", async () => {
		ekycApiModule.ekycApi.sendOtp = vi.fn().mockRejectedValue(new Error("Send failed"));

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			try {
				await result.current.sendOtp();
			} catch {
				// expected
			}
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe("Send failed");
		expect(result.current.otpSent).toBe(false);
	});

	it("should set generic error message when sendOtp fails with non-Error", async () => {
		ekycApiModule.ekycApi.sendOtp = vi.fn().mockRejectedValue("string error");

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			try {
				await result.current.sendOtp();
			} catch {
				// expected
			}
		});

		expect(result.current.error).toBe("Failed to send verification code");
	});

	it("should set loading true during confirmOtp", async () => {
		ekycApiModule.ekycApi.verifyOtp = vi.fn(
			() => new Promise((resolve) => setTimeout(resolve, 100))
		);

		const { result } = renderHook(() => useKycOtp());

		act(() => {
			result.current.confirmOtp("123456");
		});

		expect(result.current.loading).toBe(true);
	});

	it("should clear error on successful confirmOtp", async () => {
		ekycApiModule.ekycApi.verifyOtp = vi.fn().mockResolvedValue(undefined);

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			await result.current.confirmOtp("123456");
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("should set error and rethrow on confirmOtp failure", async () => {
		ekycApiModule.ekycApi.verifyOtp = vi.fn().mockRejectedValue(new Error("Invalid code"));

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			try {
				await result.current.confirmOtp("000000");
			} catch {
				// expected
			}
		});

		expect(result.current.error).toBe("Invalid code");
	});

	it("should set generic error when confirmOtp fails with non-Error", async () => {
		ekycApiModule.ekycApi.verifyOtp = vi.fn().mockRejectedValue("unknown");

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			try {
				await result.current.confirmOtp("000000");
			} catch {
				// expected
			}
		});

		expect(result.current.error).toBe("Invalid verification code");
	});

	it("should reset state to initial values", async () => {
		ekycApiModule.ekycApi.sendOtp = vi.fn().mockResolvedValue(undefined);

		const { result } = renderHook(() => useKycOtp());

		await act(async () => {
			await result.current.sendOtp();
		});

		expect(result.current.otpSent).toBe(true);

		act(() => {
			result.current.reset();
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.otpSent).toBe(false);
	});
});
