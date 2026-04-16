'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = ['Home', 'About Us', 'Pets', 'eKYC', 'Contact']

const STEPS = [
  {
    icon: '/images/ekyc/Icons.svg',
    iconBg: '#7AADA1',
    step: '01',
    title: 'Upload ID Document',
    desc: 'Provide a government-issued photo ID — passport, national identity card, or driver\'s license.',
  },
  {
    icon: '/images/ekyc/Icons-1.svg',
    iconBg: '#216959',
    step: '02',
    title: 'Personal Verification',
    desc: 'We confirm your name, date of birth and address against your submitted documents.',
  },
  {
    icon: '/images/ekyc/Icons-2.svg',
    iconBg: '#3D2C1E',
    step: '03',
    title: 'Financial Check',
    desc: 'A brief proof-of-address or income document ensures every pet is placed in a stable home.',
  },
  {
    icon: '/images/ekyc/Icons-3.svg',
    iconBg: '#C4857A',
    step: '04',
    title: 'Digital Confirmation',
    desc: 'Receive a one-time code on your phone to finalise your secure eKYC profile.',
  },
]

const WHY_ITEMS = [
  {
    title: 'Secure & Encrypted',
    desc: 'All documents are encrypted end-to-end and stored in compliance with international data-protection standards.',
  },
  {
    title: 'Takes Under 5 Minutes',
    desc: 'Our streamlined flow is designed to get you verified quickly so you can focus on finding your new companion.',
  },
  {
    title: 'Verified Once, Valid Forever',
    desc: 'Complete eKYC once and your profile is trusted across every Snuggle adoption listing.',
  },
]

export default function EKYCPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    idNumber: '',
    phone: '',
  })

  const navHref = (link: string) => {
    if (link === 'Home') return '/home'
    if (link === 'Pets') return '/pets'
    if (link === 'eKYC') return '/ekyc'
    return '#'
  }

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', position: 'relative', zIndex: 20 }}
        className="flex items-center justify-between px-6 md:px-10 py-4 rounded-b-2xl">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <PawLogo />
          <span style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 500 }}>
            Snuggle
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <Link key={link} href={navHref(link)}
              style={{
                color: link === 'eKYC' ? '#7AADA1' : '#111',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: link === 'eKYC' ? 600 : 400,
                borderBottom: link === 'eKYC' ? '2px solid #7AADA1' : 'none',
                paddingBottom: link === 'eKYC' ? '2px' : '0',
              }}
              className="hover:opacity-70 transition-opacity whitespace-nowrap">
              {link}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: '16px', border: '1px solid rgba(102,102,102,0.35)', background: '#F6F6F6' }}>
            {/* Search icon — reused inline */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <g clipPath="url(#s_ekyc)">
                <path d="M10.3333 9.33333H9.80667L9.62 9.15333C10.2733 8.39333 10.6667 7.40667 10.6667 6.33333C10.6667 3.94 8.72667 2 6.33333 2C3.94 2 2 3.94 2 6.33333C2 8.72667 3.94 10.6667 6.33333 10.6667C7.40667 10.6667 8.39333 10.2733 9.15333 9.62L9.33333 9.80667V10.3333L12.6667 13.66L13.66 12.6667L10.3333 9.33333ZM6.33333 9.33333C4.67333 9.33333 3.33333 7.99333 3.33333 6.33333C3.33333 4.67333 4.67333 3.33333 6.33333 3.33333C7.99333 3.33333 9.33333 4.67333 9.33333 6.33333C9.33333 7.99333 7.99333 9.33333 6.33333 9.33333Z" fill="#666666" fillOpacity="0.8"/>
              </g>
              <defs><clipPath id="s_ekyc"><rect width="16" height="16" fill="white"/></clipPath></defs>
            </svg>
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

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col px-6 py-6 gap-5 bg-white border-b border-[#E8E8E8]" style={{ zIndex: 15 }}>
          {NAV_LINKS.map(link => (
            <Link key={link} href={navHref(link)}
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: link === 'eKYC' ? '#7AADA1' : '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: link === 'eKYC' ? 600 : 400 }}>
              {link}
            </Link>
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
      <section className="relative overflow-hidden" style={{ background: '#F9F6F2', minHeight: '480px' }}>
        {/* Decorative teal blob */}
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(122,173,161,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-20 flex flex-col lg:flex-row items-center gap-12"
          style={{ paddingTop: '80px', paddingBottom: '80px', zIndex: 1 }}>

          {/* Text */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <Link href="/home" style={{ color: '#7AADA1', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif" }}
                className="hover:underline">Home</Link>
              {/* arrow copy icon */}
              <img src="/images/ekyc/arrow copy.svg" alt="" aria-hidden="true"
                style={{ width: '8px', height: '13px', transform: 'rotate(180deg)', opacity: 0.6 }} />
              <span style={{ color: '#7AADA1', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>eKYC</span>
            </div>

            <p className="font-semibold mb-3" style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', letterSpacing: '0.12em' }}>
              IDENTITY VERIFICATION
            </p>
            <h1 style={{ color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.15 }}
              className="mb-5">
              eKYC — Know Your<br />Customer
            </h1>
            <p className="mb-8" style={{ color: '#7A6055', fontSize: '15px', lineHeight: '1.8', maxWidth: '440px' }}>
              Before welcoming a pet into your home, Snuggle requires a quick identity check. Our secure eKYC process protects both animals and adopters, ensuring every match is built on trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => document.getElementById('start-verification')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ padding: '13px 32px', borderRadius: '40px', backgroundColor: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                Start Verification
              </button>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
                style={{ padding: '13px 32px', borderRadius: '40px', border: '1.5px solid #3D2C1E', color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                How It Works
              </button>
            </div>
          </div>

          {/* Visual — hand + image card */}
          <div className="flex-1 flex justify-center items-center relative" style={{ minHeight: '320px' }}>
            {/* Background card */}
            <div style={{
              position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)',
              width: '280px', height: '280px', borderRadius: '32px',
              background: 'linear-gradient(135deg, #216959 0%, #7AADA1 100%)',
              zIndex: 0,
            }} />

            {/* visual.png image */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <img src="/images/ekyc/visual.png" alt="eKYC Verification Visual"
                style={{ width: '260px', height: 'auto', borderRadius: '24px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>

            {/* Hand icon badge */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px',
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}>
              <img src="/images/ekyc/Hand.svg" alt="Biometric verification" style={{ width: '40px', height: '40px' }} />
            </div>

            {/* Verified badge */}
            <div style={{
              position: 'absolute', top: '10px', right: '0',
              background: '#fff', borderRadius: '12px',
              padding: '8px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              display: 'flex', alignItems: 'center', gap: '8px',
              zIndex: 2,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, color: '#216959', whiteSpace: 'nowrap' }}>Secure & Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="flex flex-wrap items-center justify-center" style={{ background: '#216959' }}>
        {[['256K+', 'Users Verified'], ['99.9%', 'Accuracy Rate'], ['< 5 min', 'Average Time']].map(([num, label], i, arr) => (
          <div key={label} className="flex items-center justify-center gap-3 py-6 px-10 sm:px-16"
            style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none', flex: '1 1 160px' }}>
            <span className="font-bold" style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px' }}>{num}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 md:px-10 lg:px-20 py-20 md:py-28" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <p className="font-semibold mb-2 text-center tracking-widest" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
            SIMPLE PROCESS
          </p>
          <h2 className="font-bold mb-4 text-center" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)' }}>
            How eKYC Works
          </h2>
          <p className="mb-14 text-center" style={{ color: '#888', fontSize: '14px', maxWidth: '480px', margin: '0 auto 56px' }}>
            Four quick steps to build a verified profile that shelters and breeders can trust.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-start">
                {/* Step number + connector */}
                <div className="flex items-center gap-3 mb-5 w-full">
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: s.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <img src={s.icon} alt={s.title} style={{ width: '28px', height: '28px', filter: s.iconBg === '#3D2C1E' || s.iconBg === '#C4857A' ? 'brightness(10)' : 'none' }} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, rgba(122,173,161,0.4), transparent)', borderRadius: '1px' }} className="hidden lg:block" />
                  )}
                </div>
                <span className="mb-2 font-bold" style={{ color: s.iconBg, fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', letterSpacing: '0.08em' }}>
                  STEP {s.step}
                </span>
                <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px' }}>
                  {s.title}
                </h3>
                <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.7' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why eKYC ── */}
      <section className="px-6 md:px-10 lg:px-20 py-16 md:py-24" style={{ background: '#F9F6F2' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-14 items-center">
          {/* Left — image/visual block */}
          <div className="flex-1 relative flex justify-center">
            <div style={{
              width: '100%', maxWidth: '420px', borderRadius: '32px',
              background: 'linear-gradient(135deg, #3D2C1E 0%, #6B4F3A 100%)',
              padding: '40px 32px',
              display: 'flex', flexDirection: 'column', gap: '24px',
            }}>
              {/* Mini ID card preview */}
              <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7AADA1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {/* user icon from ekyc/Login */}
                  <img src="/images/ekyc/Login/user.svg" alt="User" style={{ width: '32px', height: '32px' }} />
                </div>
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.3)', height: '10px', width: '100px', borderRadius: '5px', marginBottom: '8px' }} />
                  <div style={{ background: 'rgba(255,255,255,0.15)', height: '8px', width: '70px', borderRadius: '4px' }} />
                </div>
                <div style={{ marginLeft: 'auto', background: '#7AADA1', borderRadius: '8px', padding: '4px 10px' }}>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>VERIFIED</span>
                </div>
              </div>

              {/* Icon row */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {['/images/ekyc/Icons.svg', '/images/ekyc/Icons-2.svg', '/images/ekyc/Icons-3.svg'].map((src, i) => (
                  <div key={i} style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={src} alt="" style={{ width: '26px', height: '26px', filter: 'brightness(10)' }} />
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: "'Space Grotesk', sans-serif" }}>Verification Progress</span>
                  <span style={{ color: '#7AADA1', fontSize: '11px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>100%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: '100%', background: '#7AADA1', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right — text */}
          <div className="flex-1">
            <p className="font-semibold mb-3 tracking-widest" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
              WHY IT MATTERS
            </p>
            <h2 className="mb-5" style={{ color: '#216959', fontFamily: "'Francois One', sans-serif", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 400, lineHeight: '1.2' }}>
              Trust at the Heart of Every Adoption
            </h2>
            <p className="mb-8 leading-relaxed" style={{ color: '#666', fontSize: '14px', maxWidth: '420px' }}>
              Pet adoption is a life-long commitment. Our eKYC process protects animals by ensuring they go to verified, responsible owners — and it protects you by confirming that sellers and shelters are legitimate.
            </p>
            <div className="flex flex-col gap-6">
              {WHY_ITEMS.map((w, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#1C1C1C', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>{w.title}</h4>
                    <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.6' }}>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Start Verification Form ── */}
      <section id="start-verification" className="px-6 md:px-10 lg:px-20 py-20 md:py-28" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-semibold mb-2 text-center tracking-widest" style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}>
            GET STARTED
          </p>
          <h2 className="font-bold mb-4 text-center" style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)' }}>
            Begin Your Verification
          </h2>
          <p className="mb-12 text-center" style={{ color: '#888', fontSize: '14px', maxWidth: '460px', margin: '0 auto 48px' }}>
            Fill in your basic details to start the eKYC process. You'll need a valid ID and your phone number.
          </p>

          {/* Step pills */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {['Personal Info', 'Upload ID', 'Financial Proof', 'Confirm'].map((label, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className="flex items-center gap-2 whitespace-nowrap transition-all"
                style={{
                  padding: '10px 18px', borderRadius: '40px', border: 'none', cursor: 'pointer',
                  background: activeStep === i ? '#7AADA1' : '#F6F6F6',
                  color: activeStep === i ? '#fff' : '#666',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: activeStep === i ? 600 : 400,
                }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: activeStep === i ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                {label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div style={{ background: '#F9F6F2', borderRadius: '24px', padding: '40px' }}>
            {activeStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>Full Legal Name</label>
                  <input type="text" placeholder="As on your ID document" value={formData.fullName}
                    onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full h-11 rounded-xl outline-none"
                    style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '13px', color: '#333' }} />
                </div>
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth}
                    onChange={e => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full h-11 rounded-xl outline-none"
                    style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '13px', color: '#333' }} />
                </div>
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>National ID / Passport No.</label>
                  <input type="text" placeholder="e.g. AB1234567" value={formData.idNumber}
                    onChange={e => setFormData(f => ({ ...f, idNumber: e.target.value }))}
                    className="w-full h-11 rounded-xl outline-none"
                    style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '13px', color: '#333' }} />
                </div>
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>Phone Number</label>
                  <input type="tel" placeholder="+1 555 000 0000" value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full h-11 rounded-xl outline-none"
                    style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '13px', color: '#333' }} />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="flex flex-col items-center gap-6">
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { icon: '/images/ekyc/Icons.svg', label: 'National ID Card', bg: '#E8F4F1' },
                    { icon: '/images/ekyc/Icons-3.svg', label: 'Passport', bg: '#F9F6F2' },
                    { icon: '/images/ekyc/Icons-2.svg', label: "Driver's License", bg: '#FDF2F0' },
                  ].map((opt, i) => (
                    <button key={i} style={{
                      padding: '20px 24px', borderRadius: '16px', border: '2px solid #E0E0E0',
                      background: opt.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '10px', minWidth: '130px',
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#7AADA1')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E0E0E0')}>
                      <img src={opt.icon} alt={opt.label} style={{ width: '32px', height: '32px' }} />
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, color: '#333', textAlign: 'center' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{
                  width: '100%', maxWidth: '480px', borderRadius: '16px',
                  border: '2px dashed #C8DDD9', background: '#fff',
                  padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer',
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#E8F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#333' }}>Drop your file here</span>
                  <span style={{ fontSize: '12px', color: '#888' }}>PNG, JPG or PDF — max 10 MB</span>
                  <button style={{
                    marginTop: '4px', padding: '8px 20px', borderRadius: '8px',
                    background: '#7AADA1', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                  }}>
                    Choose File
                  </button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col items-center gap-6">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E8F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <img src="/images/ekyc/Icons-2.svg" alt="Financial" style={{ width: '32px', height: '32px' }} />
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', maxWidth: '380px', lineHeight: '1.7', margin: '0 auto' }}>
                    Upload a recent bank statement, utility bill, or pay slip (within the last 3 months) as proof of address and financial stability.
                  </p>
                </div>

                <div style={{
                  width: '100%', maxWidth: '480px', borderRadius: '16px',
                  border: '2px dashed #C8DDD9', background: '#fff',
                  padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer',
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#E8F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AADA1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#333' }}>Upload Financial Document</span>
                  <span style={{ fontSize: '12px', color: '#888' }}>PNG, JPG or PDF — max 10 MB</span>
                  <button style={{
                    marginTop: '4px', padding: '8px 20px', borderRadius: '8px',
                    background: '#7AADA1', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
                  }}>
                    Choose File
                  </button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col items-center gap-6 text-center">
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#216959', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <img src="/images/ekyc/Hand.svg" alt="Complete" style={{ width: '48px', height: '48px' }} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#1C1C1C' }}>
                  Ready to Confirm
                </h3>
                <p style={{ color: '#888', fontSize: '14px', maxWidth: '400px', lineHeight: '1.7' }}>
                  Review your details, then click "Submit for Verification". You'll receive an SMS code within 2 minutes to finalise the process.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {[formData.fullName, formData.dateOfBirth, formData.idNumber, formData.phone].map((val, i) => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: val ? '#7AADA1' : '#E0E0E0' }} />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {[formData.fullName, formData.dateOfBirth, formData.idNumber, formData.phone].filter(Boolean).length} / 4 fields completed
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid #E8E8E8' }}>
              <button onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-2 disabled:opacity-30 hover:opacity-70 transition-opacity"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#333', fontWeight: 500 }}>
                <img src="/images/ekyc/arrow copy.svg" alt="Back" style={{ width: '8px', height: '13px' }} />
                Back
              </button>

              {activeStep < 3 ? (
                <button onClick={() => setActiveStep(s => Math.min(3, s + 1))}
                  className="flex items-center gap-2 text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ padding: '12px 28px', borderRadius: '12px', background: '#7AADA1', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                  Continue
                  {/* Keyboard arrow down (right chevron) */}
                  <img src="/images/ekyc/Keyboard arrow down.svg" alt="" style={{ width: '20px', height: '20px' }} />
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ padding: '12px 28px', borderRadius: '12px', background: '#216959', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                  Submit for Verification
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1C1C1C' }} className="px-6 md:px-10 lg:px-20 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10 mb-10">
            <div style={{ maxWidth: '220px' }}>
              <Link href="/home" className="flex items-center gap-2 mb-4">
                <PawLogo />
                <span style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 500 }}>Snuggle</span>
              </Link>
              <a href="mailto:snuggle@gmail.com" className="block mb-1" style={{ color: '#888', fontSize: '12px' }}>Email: snuggle@gmail.com</a>
              <p style={{ color: '#888', fontSize: '12px' }}>Phone: 555-567-8901</p>
              <p style={{ color: '#888', fontSize: '12px' }}>Address: 123 Adoption Lane</p>
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

/* ─── Shared icon components ─── */

function PawLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="27" viewBox="0 0 31 30" fill="none">
      <g clipPath="url(#paw_ekyc)">
        <path d="M16.0487 15.4468C16.1192 15.4468 16.1192 15.4468 16.1912 15.4468C16.8975 15.4487 17.5488 15.49 18.2246 15.7032C18.2989 15.7244 18.3732 15.7456 18.4497 15.7675C19.5814 16.1186 20.3722 16.8432 21.1308 17.6953C21.1873 17.7574 21.2438 17.8194 21.3004 17.8814C21.7216 18.3463 22.1106 18.8294 22.4885 19.3278C22.5862 19.456 22.685 19.5834 22.784 19.7106C23.3147 20.3953 23.8076 21.1012 24.2935 21.8161C24.3849 21.9501 24.4773 22.0834 24.5706 22.2162C26.9735 25.6374 26.9735 25.6374 26.6704 27.6233C26.6309 27.7781 26.5826 27.9193 26.5195 28.0664C26.4982 28.1166 26.4769 28.1667 26.4549 28.2184C26.0945 28.9828 25.4627 29.4618 24.6593 29.7572C24.0552 29.9613 23.4703 30.0287 22.8332 30.0229C22.7091 30.022 22.5852 30.0229 22.4611 30.0241C21.7383 30.0253 21.0471 29.9205 20.3816 29.6411C20.3391 29.6239 20.2966 29.6066 20.2529 29.5888C19.8963 29.4392 19.5617 29.2585 19.2254 29.0707C17.6644 28.2012 15.5412 28.2393 13.8297 28.6453C13.4749 28.7507 13.1598 28.9028 12.8378 29.0797C11.7825 29.6548 10.8126 30.0109 9.58618 30.0173C9.49837 30.018 9.41056 30.0192 9.32277 30.0209C8.2315 30.0426 7.16503 29.8253 6.30062 29.1358C5.67623 28.5506 5.38814 27.8402 5.36012 27.0089C5.34996 26.031 5.63833 25.2829 6.1152 24.4336C6.15056 24.3702 6.18591 24.3067 6.22234 24.2414C7.42002 22.1606 8.82967 20.1049 10.414 18.2813C10.4632 18.2245 10.4632 18.2245 10.5134 18.1666C12.0261 16.4278 13.6464 15.441 16.0487 15.4468Z" fill="#EFC5BD"/>
        <path d="M22.25 0.537126C23.637 1.51311 24.3079 3.13418 24.6121 4.72132C24.697 5.27543 24.718 5.81991 24.7185 6.37934C24.7185 6.42236 24.7186 6.46538 24.7186 6.5097C24.7176 7.18558 24.683 7.83642 24.5217 8.49604C24.5061 8.56169 24.5061 8.56169 24.4902 8.62867C24.1333 10.0919 23.3983 11.546 22.0809 12.4145C21.3508 12.8325 20.5741 12.9345 19.7435 12.8043C19.5929 12.7656 19.4571 12.7172 19.3147 12.6562C19.2622 12.634 19.2098 12.6118 19.1557 12.5889C17.8297 11.9582 17.0603 10.655 16.5912 9.35461C15.8167 7.06649 16.0288 4.50232 17.0896 2.34003C17.6088 1.36226 18.3956 0.505556 19.4661 0.0914929C20.4408 -0.192237 21.4195 -0.00906445 22.25 0.537126Z" fill="#EFC5BD"/>
        <path d="M12.1673 0.396188C13.6803 1.40439 14.4007 3.06577 14.7275 4.76051C15.0999 6.89297 14.7651 9.22716 13.5627 11.0742C13.3935 11.3012 13.2122 11.5117 13.0178 11.7187C12.9831 11.7571 12.9483 11.7955 12.9125 11.835C12.3971 12.3732 11.6242 12.7977 10.8591 12.846C9.83877 12.8718 9.05292 12.61 8.29882 11.9284C7.14425 10.841 6.60057 9.36389 6.35763 7.85156C6.34639 7.78426 6.33515 7.71696 6.32357 7.64762C6.27484 7.25289 6.28233 6.85332 6.28194 6.45629C6.28188 6.41318 6.28182 6.37008 6.28176 6.32566C6.28241 5.64865 6.32063 4.99719 6.47872 4.33593C6.48747 4.29754 6.49622 4.25915 6.50524 4.2196C6.83398 2.80543 7.55416 1.29222 8.84005 0.468744C9.90809 -0.124147 11.0843 -0.229023 12.1673 0.396188Z" fill="#EFC5BD"/>
        <path d="M29.1838 9.6094C29.2475 9.64445 29.3111 9.67949 29.3768 9.7156C30.1234 10.2776 30.4761 10.9984 30.6369 11.8946C30.6872 12.7387 30.6877 13.5951 30.4553 14.4141C30.4387 14.474 30.4387 14.474 30.4217 14.5352C30.1255 15.5762 29.6043 16.5783 28.881 17.4024C28.8362 17.4538 28.7914 17.5052 28.7453 17.5582C27.9215 18.4727 26.9182 19.1601 25.6482 19.2925C24.987 19.3235 24.3723 19.1004 23.8859 18.6768C23.0021 17.7359 22.843 16.6868 22.8792 15.4489C22.9672 13.67 23.8864 11.9954 25.1271 10.7227C25.1626 10.6853 25.198 10.6479 25.2345 10.6094C26.1716 9.65359 27.8816 8.88535 29.1838 9.6094Z" fill="#EFC5BD"/>
        <path d="M5.07234 10.0548C5.35944 10.2567 5.61856 10.4838 5.87317 10.7226C5.92656 10.7678 5.92656 10.7678 5.98102 10.814C7.23278 11.9139 8.01844 13.8354 8.12307 15.4413C8.17676 16.617 8.01838 17.7219 7.17114 18.6218C7.12244 18.6641 7.07374 18.7064 7.02356 18.75C6.97985 18.7899 6.93615 18.8297 6.89111 18.8708C6.31444 19.2553 5.65556 19.355 4.97585 19.2373C3.55917 18.939 2.45326 17.9749 1.66088 16.8306C1.1646 16.077 0.783863 15.2769 0.545045 14.414C0.524597 14.342 0.504148 14.2699 0.48308 14.1957C0.24441 13.1892 0.210961 11.9854 0.605592 11.0156C0.626822 10.9621 0.648051 10.9086 0.669923 10.8536C0.93072 10.2822 1.41331 9.76026 2.00172 9.49445C3.07171 9.11379 4.17706 9.45232 5.07234 10.0548Z" fill="#EFC5BD"/>
      </g>
      <defs><clipPath id="paw_ekyc"><rect width="31" height="30" fill="white"/></clipPath></defs>
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
