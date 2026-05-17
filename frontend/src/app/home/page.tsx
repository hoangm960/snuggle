"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { QuizModal } from "@/components/QuizModal";
import HeroSection from "./sections/HeroSection";
import StatsBarSection from "./sections/StatsBarSection";
import AboutUsSection from "./sections/AboutUsSection";
import VisionSection from "./sections/VisionSection";
import PetsSection from "./sections/PetsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import ContactSection from "./sections/ContactSection";
import FooterSection from "./sections/FooterSection";

export default function HomePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [quizOpen, setQuizOpen] = useState(false);

	useEffect(() => {
		if (!loading && user?.role === "admin") {
			router.push("/admin");
		}
	}, [user, loading, router]);

	// Auto-open quiz for first-time signed-in users
	useEffect(() => {
		if (!loading && user && user.role !== "admin") {
			const key = `snuggle_quiz_shown_${user.id}`;
			if (!localStorage.getItem(key)) {
				setQuizOpen(true);
				localStorage.setItem(key, "1");
			}
		}
	}, [user, loading]);

	if (!loading && user?.role === "admin") {
		return null;
	}

	return (
		<div
			className="flex flex-col min-h-screen w-full"
			style={{ fontFamily: "'Poppins', sans-serif" }}
		>
			<QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />

			{/* Hero + About Us share the same header.png background */}
			<div style={{ position: "relative" }}>
				<Image
					src="/images/header.png"
					alt=""
					aria-hidden="true"
					fill
					className="object-cover"
					style={{
						position: "absolute",
						inset: 0,
					}}
				/>
				<Navbar variant="overlay" />
				<HeroSection onFindPet={() => setQuizOpen(true)} />
				<AboutUsSection />
			</div>
			<StatsBarSection />
			<VisionSection />
			<PetsSection />
			<TestimonialsSection />
			<ContactSection />
			<FooterSection />
		</div>
	);
}
