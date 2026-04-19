"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithPopup,
	getIdToken,
} from "firebase/auth";
import { setAuthSession } from "@/lib/cookies";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";

const FOOTER_LINKS = [
	"About",
	"Help Center",
	"Terms of Service",
	"Privacy Policy",
	"Cookie Policy",
	"Accessibility",
	"Careers",
	"Marketing",
	"Developers",
	"Settings",
];

export default function RegisterPage() {
	const router = useRouter();
	const { refreshUser } = useAuth();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [usernameError, setUsernameError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [confirmError, setConfirmError] = useState("");
	const [loading, setLoading] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);

	const validate = () => {
		let valid = true;
		setEmailError("");
		setUsernameError("");
		setPasswordError("");
		setConfirmError("");
		if (!email.trim()) {
			setEmailError("Email address is required");
			valid = false;
		}
		if (!username.trim()) {
			setUsernameError("Username is required");
			valid = false;
		}
		if (!password) {
			setPasswordError("Password is required");
			valid = false;
		} else if (password.length < 8) {
			setPasswordError("Your password must have at least 8 characters");
			valid = false;
		}
		if (!confirmPassword) {
			setConfirmError("Please re-enter your password");
			valid = false;
		} else if (password !== confirmPassword) {
			setConfirmError("Passwords do not match");
			valid = false;
		}
		return valid;
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		try {
			const response = await api.post("/auth/register", {
				email,
				password,
				displayName: username,
			});
			if (response.data.success !== true) {
				throw new Error(response.data.message || "Registration failed");
			}
			setRegistrationSuccess(true);
		} catch (err: any) {
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Registration failed. Please try again.";
			setEmailError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleRegister = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const idToken = await getIdToken(result.user);
			const response = await api.post("/auth/google", { idToken });
			if (response.data.success !== true) {
				throw new Error(response.data.message || "Google registration failed");
			}
			const { token, user } = response.data.data;
			setAuthSession(token, user);
			refreshUser();
			router.push("/home");
		} catch (err: any) {
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Google registration failed. Please try again.";
			setEmailError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleFacebookRegister = async () => {
		setLoading(true);
		try {
			const provider = new FacebookAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const idToken = await getIdToken(result.user);
			const response = await api.post("/auth/facebook", { idToken });
			if (!response.data.success) {
				throw new Error(response.data.message || "Facebook registration failed");
			}
			const { token, user } = response.data.data;
			setAuthSession(token, user);
			refreshUser();
			router.push("/home");
		} catch (err: any) {
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Facebook registration failed. Please try again.";
			setEmailError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen w-full">
			<Navbar showAuthButtons={false} />

			{/* Middle row */}
			<div className="flex flex-1">
				{/* Left column — image */}
				<div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-shrink-0">
					<img
						src="/images/hero1.png"
						alt="Pets"
						className="absolute inset-0 w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-[#7AACA1]/10" />
				</div>

				{/* Right column — form */}
				<div className="flex-1 flex flex-col bg-white overflow-y-auto">
					<main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
						<div className="w-full max-w-[420px]">
							{registrationSuccess ? (
								<div className="text-center">
									<div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7AADA1]/10 flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#7AADA1"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									</div>
									<h1
										className="text-[26px] font-semibold text-[#333333] mb-2 leading-tight"
										style={{ fontFamily: "'Space Grotesk', sans-serif" }}
									>
										Check your email
									</h1>
									<p className="text-sm text-[#666666] mb-8">
										We've sent a verification link to <strong>{email}</strong>.
										<br />
										Please check your inbox and click the link to verify your
										account.
									</p>
									<Link
										href="/login"
										className="inline-block text-white text-base font-semibold px-8 py-3 rounded-[16px] bg-[#111] hover:opacity-90 transition-opacity"
										style={{ fontFamily: "'Space Grotesk', sans-serif" }}
									>
										Go to Log in
									</Link>
								</div>
							) : (
								<>
									<h1
										className="text-[26px] font-semibold text-[#333333] mb-2 leading-tight text-center"
										style={{ fontFamily: "'Space Grotesk', sans-serif" }}
									>
										Create an account
									</h1>

									<p className="text-xs text-center text-[#999999] mb-14">
										Already have an account?{" "}
										<Link
											href="/login"
											style={{ color: "#7AADA1" }}
											className="font-medium hover:underline"
										>
											Log in
										</Link>
									</p>

									<form onSubmit={handleRegister} noValidate>
										{/* Email */}
										<div className="mb-9">
											<label className="block text-sm font-medium text-[#333333] mb-2">
												Email address
											</label>
											<input
												type="email"
												value={email}
												onChange={(e) => {
													setEmail(e.target.value);
													setEmailError("");
												}}
												placeholder="you@example.com"
												style={{
													paddingLeft: "20px",
													paddingRight: "16px",
												}}
												className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                      ${emailError ? "border-[#EB4335] bg-red-50" : "border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]"}`}
											/>
											{emailError && (
												<p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
													<ErrorIcon />
													{emailError}
												</p>
											)}
										</div>

										{/* Username */}
										<div className="mb-9">
											<label className="block text-sm font-medium text-[#333333] mb-2">
												User name
											</label>
											<input
												type="text"
												value={username}
												onChange={(e) => {
													setUsername(e.target.value);
													setUsernameError("");
												}}
												placeholder="yourname"
												style={{
													paddingLeft: "20px",
													paddingRight: "16px",
												}}
												className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                      ${usernameError ? "border-[#EB4335] bg-red-50" : "border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]"}`}
											/>
											{usernameError && (
												<p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
													<ErrorIcon />
													{usernameError}
												</p>
											)}
										</div>

										{/* Password */}
										<div className="mb-9">
											<label className="block text-sm font-medium text-[#333333] mb-2">
												Password
											</label>
											<div className="relative">
												<input
													type={showPassword ? "text" : "password"}
													value={password}
													onChange={(e) => {
														setPassword(e.target.value);
														setPasswordError("");
													}}
													placeholder="••••••••"
													style={{
														paddingLeft: "20px",
														paddingRight: "56px",
													}}
													className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                        ${passwordError ? "border-[#EB4335] bg-red-50" : "border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]"}`}
												/>
												<button
													type="button"
													onClick={() => setShowPassword((v) => !v)}
													className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#666666] hover:text-[#333333]"
												>
													{showPassword ? "Hide" : "Show"}
												</button>
											</div>
											{passwordError && (
												<p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
													<ErrorIcon />
													{passwordError}
												</p>
											)}
											{!passwordError && (
												<p className="mt-1.5 text-xs text-[#666666]">
													Your password must have at least 8 characters
												</p>
											)}
										</div>

										{/* Re-enter Password */}
										<div className="mb-9">
											<label className="block text-sm font-medium text-[#333333] mb-2">
												Re-enter Password
											</label>
											<div className="relative">
												<input
													type={showConfirm ? "text" : "password"}
													value={confirmPassword}
													onChange={(e) => {
														setConfirmPassword(e.target.value);
														setConfirmError("");
													}}
													placeholder="••••••••"
													style={{
														paddingLeft: "20px",
														paddingRight: "56px",
													}}
													className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                        ${confirmError ? "border-[#EB4335] bg-red-50" : "border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]"}`}
												/>
												<button
													type="button"
													onClick={() => setShowConfirm((v) => !v)}
													className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#666666] hover:text-[#333333]"
												>
													{showConfirm ? "Hide" : "Show"}
												</button>
											</div>
											{confirmError && (
												<p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
													<ErrorIcon />
													{confirmError}
												</p>
											)}
										</div>

										{/* Terms */}
										<p className="text-xs text-[#999999] mb-10 leading-relaxed">
											By creating an account, you agree to our{" "}
											<a
												href="#"
												className="underline text-[#333333] hover:text-[#7AADA1]"
											>
												Terms of use
											</a>{" "}
											and{" "}
											<a
												href="#"
												className="underline text-[#333333] hover:text-[#7AADA1]"
											>
												Privacy Policy
											</a>
										</p>

										{/* Submit */}
										<div className="flex justify-center mb-14">
											<button
												type="submit"
												disabled={loading}
												className="flex items-center justify-center text-white text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
												style={{
													width: "140px",
													height: "48px",
													borderRadius: "16px",
													backgroundColor: "#111",
												}}
											>
												{loading ? "Signing up…" : "Sign up"}
											</button>
										</div>
									</form>

									{/* Or continue with */}
									<div
										className="text-xs text-[#999999] text-center"
										style={{ border: "none", marginBottom: "24px" }}
									>
										Or continue with
									</div>

									{/* Social buttons */}
									<div className="flex flex-col gap-4">
										<button
											type="button"
											onClick={handleGoogleRegister}
											className="flex items-center justify-center gap-3 w-full text-[#333333] text-sm font-medium hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
											style={{
												height: "48px",
												borderRadius: "40px",
												border: "1px solid #333",
												background: "#FFF",
											}}
										>
											<GoogleIcon />
											Continue with Google
										</button>
										<button
											type="button"
											onClick={handleFacebookRegister}
											className="flex items-center justify-center gap-3 w-full text-[#333333] text-sm font-medium hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
											style={{
												height: "48px",
												borderRadius: "40px",
												border: "1px solid #333",
												background: "#FFF",
											}}
										>
											<FacebookIcon />
											Continue with Facebook
										</button>
									</div>
								</>
							)}
						</div>
					</main>
				</div>
			</div>

			{/* Full-width footer */}
			<footer className="px-8 py-6 border-t border-[#CCCCCC] bg-white">
				<div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mb-3">
					{FOOTER_LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="text-xs text-[#666666] hover:text-[#333333] hover:underline"
						>
							{link}
						</a>
					))}
				</div>
				<p className="text-xs text-[#999999] text-center">© 2026 Snuggle</p>
			</footer>
		</div>
	);
}

function GlobeIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	);
}

function GoogleIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24">
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EB4335"
			/>
		</svg>
	);
}

function FacebookIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="32"
			height="32"
			viewBox="0 0 32 32"
			fill="none"
		>
			<circle cx="16" cy="16" r="14" fill="#0C82EE" />
			<path
				d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z"
				fill="white"
			/>
		</svg>
	);
}

function ErrorIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
		</svg>
	);
}
