"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
	id: string;
	from: "user" | "bot";
	text: string;
	time: string;
}

const botReplies: Record<string, string> = {
	default: "Thanks for reaching out! Our team will get back to you soon. In the meantime, feel free to browse our available pets 🐾",
	adoption: "Our adoption process is simple! Browse our pets, submit a request, complete eKYC verification, and we'll match you with your perfect companion.",
	hello: "Hi there! Welcome to Snuggle 🐾 How can I help you today?",
	hi: "Hello! Welcome to Snuggle 🐾 Looking to adopt a furry friend?",
	cost: "Adoption fees vary by pet and shelter. Most pets range from $50–$200 which covers vaccinations, microchipping, and spay/neuter.",
	vaccine: "All our pets are up to date on core vaccinations before adoption. You can view health records on each pet's profile page.",
	contact: "You can reach us at hello@snuggle.com or fill out the contact form on our website. We typically reply within 24 hours.",
};

function getReply(text: string): string {
	const lower = text.toLowerCase();
	for (const [key, reply] of Object.entries(botReplies)) {
		if (key !== "default" && lower.includes(key)) return reply;
	}
	return botReplies.default;
}

function now(): string {
	return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBox() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{ id: "1", from: "bot", text: "Hi! 👋 I'm Snuggle's assistant. Ask me anything about adoptions, our pets, or the process!", time: now() },
	]);
	const [input, setInput] = useState("");
	const [typing, setTyping] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, open]);

	function send() {
		const text = input.trim();
		if (!text) return;
		const userMsg: Message = { id: Date.now().toString(), from: "user", text, time: now() };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setTyping(true);

		setTimeout(() => {
			const botMsg: Message = { id: (Date.now() + 1).toString(), from: "bot", text: getReply(text), time: now() };
			setMessages((prev) => [...prev, botMsg]);
			setTyping(false);
		}, 900);
	}

	function handleKey(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
	}

	return (
		<>
			{/* Bubble button */}
			<button onClick={() => setOpen((v) => !v)}
				className="fixed bottom-6 right-6 size-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
				style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
				{open ? <X className="size-5" /> : <MessageCircle className="size-6" />}
			</button>

			{/* Chat window */}
			{open && (
				<div className="fixed bottom-24 right-6 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
					style={{ background: "#fff", border: "1px solid #E8E8E8", maxHeight: "480px" }}>
					{/* Header */}
					<div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
						<div className="size-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
							<Bot className="size-4" />
						</div>
						<div>
							<p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontWeight: 600 }}>Snuggle Support</p>
							<p style={{ fontSize: "11px", opacity: 0.8 }}>Usually replies instantly</p>
						</div>
						<button onClick={() => setOpen(false)} className="ml-auto size-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
							<X className="size-3.5" />
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F9F6F2" }}>
						{messages.map((msg) => (
							<div key={msg.id} className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
								<div className="size-6 rounded-full flex items-center justify-center shrink-0"
									style={{ background: msg.from === "bot" ? "#E8F4F1" : "#216959" }}>
									{msg.from === "bot" ? <Bot className="size-3.5" style={{ color: "#7AADA1" }} /> : <User className="size-3.5 text-white" />}
								</div>
								<div className="max-w-[78%]">
									<div className="rounded-2xl px-3 py-2" style={{
										background: msg.from === "bot" ? "#fff" : "linear-gradient(135deg, #7AADA1, #216959)",
										color: msg.from === "bot" ? "#333" : "#fff",
										borderBottomLeftRadius: msg.from === "bot" ? "4px" : undefined,
										borderBottomRightRadius: msg.from === "user" ? "4px" : undefined,
										border: msg.from === "bot" ? "1px solid #F0F0F0" : "none",
									}}>
										<p style={{ fontSize: "13px", lineHeight: 1.5 }}>{msg.text}</p>
									</div>
									<p style={{ fontSize: "10px", color: "#bbb", marginTop: "3px", textAlign: msg.from === "user" ? "right" : "left" }}>{msg.time}</p>
								</div>
							</div>
						))}
						{typing && (
							<div className="flex items-end gap-2">
								<div className="size-6 rounded-full flex items-center justify-center" style={{ background: "#E8F4F1" }}>
									<Bot className="size-3.5" style={{ color: "#7AADA1" }} />
								</div>
								<div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: "#fff", border: "1px solid #F0F0F0", borderBottomLeftRadius: "4px" }}>
									{[0, 1, 2].map((i) => (
										<span key={i} className="size-1.5 rounded-full" style={{ background: "#ccc", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
									))}
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					{/* Input */}
					<div className="p-3 flex gap-2" style={{ background: "#fff", borderTop: "1px solid #F0F0F0" }}>
						<input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
							placeholder="Type a message..."
							className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
							style={{ background: "#F9F6F2", border: "1px solid #E8E8E8", color: "#333" }} />
						<button onClick={send} disabled={!input.trim()}
							className="size-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
							style={{ background: "linear-gradient(135deg, #7AADA1, #216959)", color: "#fff" }}>
							<Send className="size-4" />
						</button>
					</div>
				</div>
			)}

			<style>{`
				@keyframes bounce {
					0%, 80%, 100% { transform: translateY(0); }
					40% { transform: translateY(-4px); }
				}
			`}</style>
		</>
	);
}
