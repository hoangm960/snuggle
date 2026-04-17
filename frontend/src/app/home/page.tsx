import HeaderSection from './sections/HeaderSection'
import HeroSection from './sections/HeroSection'
import StatsBarSection from './sections/StatsBarSection'
import AboutUsSection from './sections/AboutUsSection'
import VisionSection from './sections/VisionSection'
import PetsSection from './sections/PetsSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'
import FooterSection from './sections/FooterSection'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Hero + About Us share the same header.png background */}
      <div style={{ position: 'relative' }}>
        <img
          src="/images/header.png"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
        />
        <HeaderSection />
        <HeroSection />
        <AboutUsSection />
      </div>
      <StatsBarSection />
      <VisionSection />
      <PetsSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  )
}
