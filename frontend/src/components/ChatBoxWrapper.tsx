"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ChatBox = dynamic(() => import("./ChatBox"), { ssr: false });

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/signup"];

export default function ChatBoxWrapper() {
	const pathname = usePathname();
	const hidden = HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
	if (hidden) return null;
	return <ChatBox />;
}
