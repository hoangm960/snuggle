import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import ChatBoxWrapper from "@/components/ChatBoxWrapper";

export const metadata: Metadata = {
	title: "Snuggle",
	description: "Pet adoption platform",
	icons: {
		icon: "/images/logo.svg",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<AuthProvider>
					{children}
					<ChatBoxWrapper />
				</AuthProvider>
			</body>
		</html>
	);
}
