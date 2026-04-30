"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ChatWidget from "./ChatWidget";

export default function ChatButton() {
	const { user } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [hasUnread, setHasUnread] = useState(false);

	useEffect(() => {
		if (!user) return;
	}, [user]);

	if (!user || user.role === "admin") return null;

	return (
		<>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
				style={{
					width: "60px",
					height: "60px",
					backgroundColor: "#7AADA1",
				}}
				aria-label="Open chat"
			>
				{isOpen ? (
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				) : (
					<svg
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
				)}
			</button>
			{hasUnread && !isOpen && (
				<span
					className="fixed bottom-20 right-6 z-50 flex h-3 w-3 rounded-full"
					style={{ backgroundColor: "#EB4335" }}
				/>
			)}
			{isOpen && <ChatWidget onClose={() => setIsOpen(false)} />}
		</>
	);
}