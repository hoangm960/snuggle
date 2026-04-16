'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = ['Home', 'About Us', 'Pets', 'eKYC', 'Contact']

const VISION_ITEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Find your perfect pet worldwide',
    desc: 'Browse thousands of pets from trusted shelters and breeders across the globe.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Build meaningful ties with pets',
    desc: 'Connect deeply with animals and create lifelong bonds that enrich your life.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    title: 'Daily homes for every pet',
    desc: 'Ensuring every animal finds a safe, loving, and permanent home every day.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    title: 'Connecting pets across borders',
    desc: 'A global community of pet lovers building trust and care for animals worldwide.',
  },
]

const PETS = [
  { name: 'Luna', breed: 'Golden Retriever', age: '2 years', img: '/images/pets/1.png' },
  { name: 'Mochi', breed: 'Persian Cat', age: '1 year', img: '/images/pets/2.png' },
  { name: 'Buddy', breed: 'Labrador', age: '3 years', img: '/images/pets/3.png' },
  { name: 'Cleo', breed: 'Siamese Cat', age: '2 years', img: '/images/pets/4.png' },
  { name: 'Max', breed: 'Beagle', age: '4 years', img: '/images/pets/5.png' },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Pet Shelter Partner',
    text: 'Snuggle has completely transformed how we connect animals with loving families. The platform is intuitive and our adoption rates have tripled since joining.',
  },
  {
    name: 'James Nguyen',
    role: 'Verified Adopter',
    text: 'I found my best friend Luna through Snuggle. The process was seamless and the team was incredibly supportive throughout the entire journey.',
  },
  {
    name: 'Amira Patel',
    role: 'Rescue Organization',
    text: "The reach Snuggle gives us is unmatched. We've rehomed pets to families across the world and the trust framework they've built is outstanding.",
  },
]

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

export default function HomePage() {
  const [petIndex, setPetIndex] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const windowWidth = useWindowWidth()

  const visibleCount = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3
  const maxIndex = PETS.length - visibleCount

  const prevPet = () => setPetIndex(i => Math.max(0, i - 1))
  const nextPet = () => setPetIndex(i => Math.min(maxIndex, i + 1))

  // Clamp index when visibleCount changes
  useEffect(() => {
    setPetIndex(i => Math.min(i, Math.max(0, maxIndex)))
  }, [maxIndex])

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Hero wrapper (header overlaid + fullscreen) ── */}
      <div style={{ position: 'relative' }}>

      {/* ── Header ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
        className="flex items-center justify-between px-6 md:px-10 py-4 rounded-b-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <PawLogo />
          <span style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 500 }}>
            Snuggle
          </span>
        </div>

        {/* Desktop: nav + right controls */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <a key={link} href={link === 'eKYC' ? '/ekyc' : `#${link.toLowerCase().replace(' ', '-')}`}
              style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 400 }}
              className="hover:opacity-60 transition-opacity whitespace-nowrap">
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: '16px', border: '1px solid rgba(102,102,102,0.35)', background: '#F6F6F6' }}>
            <SearchIcon />
            <input type="search" placeholder="Search..." className="bg-transparent outline-none w-28"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#333' }} />
          </div>
          <button className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <GlobeIcon />
            <span style={{ margin: '0 2px' }}>English (US)</span>
            <svg width="10" height="5" viewBox="0 0 10 5" fill="none"><path d="M0 0L5 5L10 0H0Z" fill="#333"/></svg>
          </button>
          <Link href="/login" className="flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
            style={{ width: '98px', height: '40px', borderRadius: '8px', backgroundColor: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
            Log in
          </Link>
          <Link href="/register" className="flex items-center justify-center font-medium hover:opacity-80 transition-opacity"
            style={{ width: '98px', height: '40px', borderRadius: '8px', border: '1px solid #111', color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
            Sign up
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', borderRadius: '2px',
            transform: mobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', borderRadius: '2px',
            opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', borderRadius: '2px',
            transform: mobileMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col px-6 py-6 gap-5 bg-white border-b border-[#E8E8E8]" style={{ position: 'absolute', top: '72px', left: 0, right: 0, zIndex: 15 }}>
          {NAV_LINKS.map(link => (
            <a key={link} href={link === 'eKYC' ? '/ekyc' : `#${link.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 400 }}>
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-white font-medium"
              style={{ height: '40px', borderRadius: '8px', backgroundColor: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
              Log in
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center font-medium"
              style={{ height: '40px', borderRadius: '8px', border: '1px solid #111', color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section id="home" className="relative overflow-hidden" style={{ background: '#fff', minHeight: '100vh' }}>
        <img src="/images/decorate/bg1.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', zIndex: 0 }} />

        {/* Mobile: stacked layout */}
        <div className="relative flex flex-col lg:flex-row lg:items-stretch" style={{ zIndex: 1, minHeight: '100vh' }}>
          {/* Text side */}
          <div className="flex flex-col justify-center px-6 md:px-14 w-full lg:w-[52%]" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
            <p className="font-semibold mb-4"
              style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', letterSpacing: '0.12em' }}>
              WELCOME TO SNUGGLE
            </p>
            <h1 className="font-bold mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 58px)', color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'italic', lineHeight: 1.1 }}>
              LET'S FIND YOUR<br />PAWFECT MATCH!
            </h1>
            <p className="mb-8" style={{ color: '#7A6055', fontSize: '14px', lineHeight: '1.75', maxWidth: '380px' }}>
              Connecting loving families with pets who need a home. Browse, adopt, and build a bond that lasts a lifetime.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register"
                className="flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ padding: '13px 30px', borderRadius: '40px', backgroundColor: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                Find a Pet
              </Link>
              <a href="#about-us"
                className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
                style={{ padding: '13px 30px', borderRadius: '40px', border: '1.5px solid #3D2C1E', color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                Learn More
              </a>
            </div>
          </div>

          {/* Image side — full height on desktop, fixed height on mobile */}
          <div className="relative w-full lg:flex-1 overflow-hidden" style={{ minHeight: '50vh' }}>
            <img src="/images/header.png" alt="Cute pets"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        </div>
      </section>

      </div>{/* end hero wrapper */}

      {/* ── Stats Bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-0" style={{ background: '#2D6A5F' }}>
        {[['99+', 'Pets Available'], ['99+', 'Matches Made'], ['99+', 'Animals Rescued']].map(([num, label], i, arr) => (
          <div key={label} className="flex items-center justify-center gap-3 py-7 px-10 sm:px-16"
            style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none', flex: '1 1 160px' }}>
            <span className="font-bold" style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px' }}>{num}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── About Us ── */}
      <section id="about-us" className="relative px-6 md:px-10 lg:px-20 py-16 md:py-24" style={{ background: '#fff' }}>
        <div className="flex flex-col lg:flex-row items-center gap-10 max-w-6xl mx-auto">
          {/* Left text */}
          <div className="flex-1 w-full" style={{ zIndex: 1 }}>
            <p className="font-semibold mb-3 tracking-widest" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
              ABOUT US
            </p>
            <h2 className="mb-5" style={{ color: '#216959', fontFamily: "'Francois One', sans-serif", fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 400, lineHeight: '1.2' }}>
              Smart Matching for Happy Lives
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: '#666', fontSize: '14px', maxWidth: '420px' }}>
              Snuggle is a data-driven pet adoption platform dedicated to creating perfect matches. By combining lifestyle algorithms with secure identity verification, we ensure every pet finds their true forever home. Find your perfect animal soulmate.
            </p>
            <a href="#pets"
              className="inline-flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
              style={{ padding: '11px 28px', borderRadius: '8px', border: '1.5px solid #3D2C1E', color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>
              Learn More
            </a>
          </div>

          {/* Right — teal blob + image */}
          <div className="flex-1 w-full relative flex justify-center items-center" style={{ minHeight: '340px' }}>
            <img src="/images/decorate/bg1.svg" alt="" aria-hidden="true"
              style={{ position: 'absolute', right: '-120px', top: '-80px', width: '70%', minWidth: '520px', height: 'auto', zIndex: 0 }} />
            <img src="/images/cute.png" alt="About Snuggle"
              style={{ position: 'relative', zIndex: 1, width: 'min(280px, 75%)', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </section>

      {/* ── Our Vision ── */}
      <section className="px-6 md:px-10 lg:px-20 py-16 md:py-24" style={{ background: '#F9F6F2' }}>
        <div className="max-w-6xl mx-auto">
          <p className="font-semibold mb-2 tracking-widest text-center" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
            We help...
          </p>
          <h2 className="font-bold mb-14 text-center" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)' }}>
            Our Vision
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
            {[
              { title: 'Find your perfect animal soulmate' },
              { title: 'Built on data and trust' },
              { title: 'Safe homes for every pet' },
              { title: 'Smart matching for happy lives' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-start">
                <p className="font-semibold leading-snug" style={{ color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: '1.4' }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Pets ── */}
      <section id="pets" className="relative px-6 md:px-10 lg:px-20 py-20 md:py-28" style={{ background: '#fff' }}>
        {/* Pink blob — centered behind the cards */}
        <img src="/images/decorate/bg2.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'max(1300px, 110vw)', height: 'auto', zIndex: 0, pointerEvents: 'none' }} />

        <div className="relative max-w-6xl mx-auto" style={{ zIndex: 1 }}>
          {/* Title + arrows */}
          <div className="flex items-center justify-between mb-10 md:mb-12">
            <div>
              <p className="font-semibold mb-1 tracking-widest" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
                FIND YOUR MATCH
              </p>
              <h2 className="font-bold" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 28px)' }}>Our Pets</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={prevPet} disabled={petIndex === 0}
                className="flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.14)', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={nextPet} disabled={petIndex >= maxIndex}
                className="flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7AADA1', boxShadow: '0 2px 16px rgba(0,0,0,0.14)', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: `repeat(${visibleCount}, 1fr)` }}>
            {PETS.slice(petIndex, petIndex + visibleCount).map(pet => (
              <div key={pet.name} className="rounded-3xl overflow-hidden bg-white"
                style={{ boxShadow: '0 6px 32px rgba(0,0,0,0.10)', minWidth: 0 }}>
                <div className="relative w-full" style={{ paddingTop: '75%', overflow: 'hidden' }}>
                  <img src={pet.img} alt={pet.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1"
                    style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 600 }}>
                    Available
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-semibold mb-1" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px' }}>{pet.name}</h3>
                  <p className="mb-5" style={{ color: '#888', fontSize: '13px' }}>{pet.breed} · {pet.age}</p>
                  <Link href="/register"
                    className="block text-center font-semibold py-3 rounded-[40px] transition-opacity hover:opacity-80"
                    style={{ background: '#F0F7F5', color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>
                    Adopt Me
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setPetIndex(i)} style={{
                width: petIndex === i ? '28px' : '8px', height: '8px', borderRadius: '4px',
                background: petIndex === i ? '#7AADA1' : 'rgba(0,0,0,0.15)',
                border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0,
              }} />
            ))}
          </div>

          {/* More button */}
          <div className="flex justify-center mt-8">
            <Link href="/pets"
              className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
              style={{ padding: '12px 36px', borderRadius: '8px', background: '#3D2C1E', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>
              More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 md:px-10 lg:px-20 py-16 md:py-24" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <p className="font-semibold mb-2 tracking-widest text-center" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
            Feedback
          </p>
          <h2 className="font-bold mb-12 text-center" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 28px)' }}>
            What Our Partners Say About Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {TESTIMONIALS.concat([{
              name: 'Hearts of Taras',
              role: 'Adopter',
              text: 'Best adoption app out there, period. If you are looking for a sign to find your new bestie, this is it. Secure, beautiful, and super easy to use. Highly recommend!',
            }]).map(t => (
              <div key={t.name} className="flex flex-col gap-3">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F5A623">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <div style={{ fontSize: '30px', lineHeight: '1', fontFamily: 'Georgia, serif', color: '#7AADA1' }}>"</div>
                <p className="leading-relaxed" style={{ color: '#555', fontSize: '13px', marginTop: '-12px' }}>{t.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>{t.name}</div>
                    <div className="mt-0.5" style={{ color: '#7AADA1', fontSize: '11px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get In Touch ── */}
      <section id="contact" className="relative px-6 md:px-10 lg:px-20 py-16 md:py-24" style={{ background: '#6B4F3A', overflow: 'hidden' }}>
        <img src="/images/decorate/bg3.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 0, pointerEvents: 'none' }} />
        <div className="w-full max-w-2xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <p className="font-semibold mb-2 tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '0.14em' }}>
            Drop us a question
          </p>
          <h2 className="font-bold mb-8 text-center" style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)' }}>
            Get In Touch
          </h2>

          {/* Radio buttons */}
          <div className="flex gap-6 mb-6">
            {['Say Hi', 'Ask a Question'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer" style={{ color: '#fff', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif" }}>
                <span style={{
                  display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.7)', flexShrink: 0,
                  background: opt === 'Say Hi' ? '#fff' : 'transparent'
                }} />
                {opt}
              </label>
            ))}
          </div>

          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <div>
              <label className="block font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Name</label>
              <input type="text" placeholder="Name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-11 rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px' }} />
            </div>
            <div>
              <label className="block font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Email*</label>
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-11 rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px' }} />
            </div>
            <div>
              <label className="block font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Message*</label>
              <textarea placeholder="Message" value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={5}
                className="w-full rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', paddingTop: '12px', resize: 'none', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px' }} />
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity mt-1"
              style={{ height: '48px', borderRadius: '12px', backgroundColor: '#C4857A', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1C1C1C' }} className="px-6 md:px-10 lg:px-20 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10 mb-10">
            <div style={{ maxWidth: '220px' }}>
              <div className="flex items-center gap-2 mb-4">
                <PawLogo />
                <span style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 500 }}>Snuggle</span>
              </div>
              <a href="mailto:snuggle@gmail.com" className="block mb-1" style={{ color: '#888', fontSize: '12px' }}>Email: snuggle@gmail.com</a>
              <p style={{ color: '#888', fontSize: '12px' }}>Phone: 555-567-8901</p>
              <p style={{ color: '#888', fontSize: '12px' }}>Address: adsgefgs</p>
              <button className="mt-5 px-5 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
                style={{ background: '#C4857A', color: '#fff', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif", border: 'none', cursor: 'pointer' }}>
                Contact us
              </button>
            </div>
            <div className="flex items-end gap-3 flex-wrap">
              <input type="email" placeholder="Email"
                className="h-10 rounded-lg outline-none"
                style={{ paddingLeft: '14px', paddingRight: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', minWidth: '200px' }} />
              <button className="h-10 px-5 rounded-lg font-medium hover:opacity-80 transition-opacity"
                style={{ background: '#C4857A', color: '#fff', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif", border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Subscribe for news
              </button>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: '#2E2E2E' }}>
            <p style={{ color: '#555', fontSize: '12px' }}>© 2026 Snuggle. All Rights Reserved.</p>
            <a href="#" style={{ color: '#555', fontSize: '12px' }} className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PawLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="27" viewBox="0 0 31 30" fill="none">
      <g clipPath="url(#paw_home)">
        <path d="M16.0487 15.4468C16.1192 15.4468 16.1192 15.4468 16.1912 15.4468C16.8975 15.4487 17.5488 15.49 18.2246 15.7032C18.2989 15.7244 18.3732 15.7456 18.4497 15.7675C19.5814 16.1186 20.3722 16.8432 21.1308 17.6953C21.1873 17.7574 21.2438 17.8194 21.3004 17.8814C21.7216 18.3463 22.1106 18.8294 22.4885 19.3278C22.5862 19.456 22.685 19.5834 22.784 19.7106C23.3147 20.3953 23.8076 21.1012 24.2935 21.8161C24.3849 21.9501 24.4773 22.0834 24.5706 22.2162C26.9735 25.6374 26.9735 25.6374 26.6704 27.6233C26.6309 27.7781 26.5826 27.9193 26.5195 28.0664C26.4982 28.1166 26.4769 28.1667 26.4549 28.2184C26.0945 28.9828 25.4627 29.4618 24.6593 29.7572C24.0552 29.9613 23.4703 30.0287 22.8332 30.0229C22.7091 30.022 22.5852 30.0229 22.4611 30.0241C21.7383 30.0253 21.0471 29.9205 20.3816 29.6411C20.3391 29.6239 20.2966 29.6066 20.2529 29.5888C19.8963 29.4392 19.5617 29.2585 19.2254 29.0707C17.6644 28.2012 15.5412 28.2393 13.8297 28.6453C13.4749 28.7507 13.1598 28.9028 12.8378 29.0797C11.7825 29.6548 10.8126 30.0109 9.58618 30.0173C9.49837 30.018 9.41056 30.0192 9.32277 30.0209C8.2315 30.0426 7.16503 29.8253 6.30062 29.1358C5.67623 28.5506 5.38814 27.8402 5.36012 27.0089C5.34996 26.031 5.63833 25.2829 6.1152 24.4336C6.15056 24.3702 6.18591 24.3067 6.22234 24.2414C7.42002 22.1606 8.82967 20.1049 10.414 18.2813C10.4632 18.2245 10.4632 18.2245 10.5134 18.1666C12.0261 16.4278 13.6464 15.441 16.0487 15.4468Z" fill="#EFC5BD"/>
        <path d="M22.25 0.537126C23.637 1.51311 24.3079 3.13418 24.6121 4.72132C24.697 5.27543 24.718 5.81991 24.7185 6.37934C24.7185 6.42236 24.7186 6.46538 24.7186 6.5097C24.7176 7.18558 24.683 7.83642 24.5217 8.49604C24.5061 8.56169 24.5061 8.56169 24.4902 8.62867C24.1333 10.0919 23.3983 11.546 22.0809 12.4145C21.3508 12.8325 20.5741 12.9345 19.7435 12.8043C19.5929 12.7656 19.4571 12.7172 19.3147 12.6562C19.2622 12.634 19.2098 12.6118 19.1557 12.5889C17.8297 11.9582 17.0603 10.655 16.5912 9.35461C15.8167 7.06649 16.0288 4.50232 17.0896 2.34003C17.6088 1.36226 18.3956 0.505556 19.4661 0.0914929C20.4408 -0.192237 21.4195 -0.00906445 22.25 0.537126Z" fill="#EFC5BD"/>
        <path d="M12.1673 0.396188C13.6803 1.40439 14.4007 3.06577 14.7275 4.76051C15.0999 6.89297 14.7651 9.22716 13.5627 11.0742C13.3935 11.3012 13.2122 11.5117 13.0178 11.7187C12.9831 11.7571 12.9483 11.7955 12.9125 11.835C12.3971 12.3732 11.6242 12.7977 10.8591 12.846C9.83877 12.8718 9.05292 12.61 8.29882 11.9284C7.14425 10.841 6.60057 9.36389 6.35763 7.85156C6.34639 7.78426 6.33515 7.71696 6.32357 7.64762C6.27484 7.25289 6.28233 6.85332 6.28194 6.45629C6.28188 6.41318 6.28182 6.37008 6.28176 6.32566C6.28241 5.64865 6.32063 4.99719 6.47872 4.33593C6.48747 4.29754 6.49622 4.25915 6.50524 4.2196C6.83398 2.80543 7.55416 1.29222 8.84005 0.468744C9.90809 -0.124147 11.0843 -0.229023 12.1673 0.396188Z" fill="#EFC5BD"/>
        <path d="M29.1838 9.6094C29.2475 9.64445 29.3111 9.67949 29.3768 9.7156C30.1234 10.2776 30.4761 10.9984 30.6369 11.8946C30.6872 12.7387 30.6877 13.5951 30.4553 14.4141C30.4387 14.474 30.4387 14.474 30.4217 14.5352C30.1255 15.5762 29.6043 16.5783 28.881 17.4024C28.8362 17.4538 28.7914 17.5052 28.7453 17.5582C27.9215 18.4727 26.9182 19.1601 25.6482 19.2925C24.987 19.3235 24.3723 19.1004 23.8859 18.6768C23.0021 17.7359 22.843 16.6868 22.8792 15.4489C22.9672 13.67 23.8864 11.9954 25.1271 10.7227C25.1626 10.6853 25.198 10.6479 25.2345 10.6094C26.1716 9.65359 27.8816 8.88535 29.1838 9.6094Z" fill="#EFC5BD"/>
        <path d="M5.07234 10.0548C5.35944 10.2567 5.61856 10.4838 5.87317 10.7226C5.92656 10.7678 5.92656 10.7678 5.98102 10.814C7.23278 11.9139 8.01844 13.8354 8.12307 15.4413C8.17676 16.617 8.01838 17.7219 7.17114 18.6218C7.12244 18.6641 7.07374 18.7064 7.02356 18.75C6.97985 18.7899 6.93615 18.8297 6.89111 18.8708C6.31444 19.2553 5.65556 19.355 4.97585 19.2373C3.55917 18.939 2.45326 17.9749 1.66088 16.8306C1.1646 16.077 0.783863 15.2769 0.545045 14.414C0.524597 14.342 0.504148 14.2699 0.48308 14.1957C0.24441 13.1892 0.210961 11.9854 0.605592 11.0156C0.626822 10.9621 0.648051 10.9086 0.669923 10.8536C0.93072 10.2822 1.41331 9.76026 2.00172 9.49445C3.07171 9.11379 4.17706 9.45232 5.07234 10.0548Z" fill="#EFC5BD"/>
      </g>
      <defs><clipPath id="paw_home"><rect width="31" height="30" fill="white"/></clipPath></defs>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <g clipPath="url(#s_home)">
        <path d="M10.3333 9.33333H9.80667L9.62 9.15333C10.2733 8.39333 10.6667 7.40667 10.6667 6.33333C10.6667 3.94 8.72667 2 6.33333 2C3.94 2 2 3.94 2 6.33333C2 8.72667 3.94 10.6667 6.33333 10.6667C7.40667 10.6667 8.39333 10.2733 9.15333 9.62L9.33333 9.80667V10.3333L12.6667 13.66L13.66 12.6667L10.3333 9.33333ZM6.33333 9.33333C4.67333 9.33333 3.33333 7.99333 3.33333 6.33333C3.33333 4.67333 4.67333 3.33333 6.33333 3.33333C7.99333 3.33333 9.33333 4.67333 9.33333 6.33333C9.33333 7.99333 7.99333 9.33333 6.33333 9.33333Z" fill="#666666" fillOpacity="0.8"/>
      </g>
      <defs><clipPath id="s_home"><rect width="16" height="16" fill="white"/></clipPath></defs>
    </svg>
  )
}
