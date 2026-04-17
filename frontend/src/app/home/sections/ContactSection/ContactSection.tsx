'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <div style={{ overflow: 'hidden', marginTop: '-80px', paddingTop: '80px' }}>
    <section
      id="contact"
      className="relative px-6 md:px-10 lg:px-20 py-16 md:py-24"
    >
      <img
        src="/images/decorate/bg3.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'max(1440px, 100%)',
          height: 'auto',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Beige card */}
      <div
        className="relative w-full max-w-4xl mx-auto"
        style={{ zIndex: 1, background: '#F3EDE1', borderRadius: '24px', overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}
      >
        {/* Form side */}
        <div className="flex flex-col justify-center px-8 md:px-12 py-10 w-full lg:w-[58%]">
          <p
            className="font-semibold mb-2 tracking-widest text-center"
            style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}
          >
            Drop us a question
          </p>
          <h2
            className="font-bold mb-6 text-center"
            style={{ color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            Get In Touch
          </h2>

          {/* Radio buttons */}
          <div className="flex gap-6 mb-5">
            {['Say Hi', 'Ask a Question'].map(opt => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: '#3D2C1E', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span style={{
                  display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%',
                  border: '1.5px solid #3D2C1E', flexShrink: 0,
                  background: opt === 'Say Hi' ? '#3D2C1E' : 'transparent',
                }} />
                {opt}
              </label>
            ))}
          </div>

          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-3">
            <div>
              <label className="block font-medium mb-1.5" style={{ color: '#3D2C1E', fontSize: '12px' }}>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-11 rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid rgba(0,0,0,0.15)', background: '#fff', color: '#333', fontSize: '13px' }}
              />
            </div>
            <div>
              <label className="block font-medium mb-1.5" style={{ color: '#3D2C1E', fontSize: '12px' }}>Email*</label>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-11 rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', border: '1px solid rgba(0,0,0,0.15)', background: '#fff', color: '#333', fontSize: '13px' }}
              />
            </div>
            <div>
              <label className="block font-medium mb-1.5" style={{ color: '#3D2C1E', fontSize: '12px' }}>Message*</label>
              <textarea
                placeholder="Message"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={4}
                className="w-full rounded-xl outline-none transition-colors"
                style={{ paddingLeft: '14px', paddingRight: '14px', paddingTop: '12px', resize: 'none', border: '1px solid rgba(0,0,0,0.15)', background: '#fff', color: '#333', fontSize: '13px' }}
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity mt-1"
              style={{ height: '48px', borderRadius: '12px', backgroundColor: '#C4857A', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Pets image side — hidden on mobile */}
        <div className="hidden lg:flex flex-1 items-end justify-center" style={{ minHeight: '420px' }}>
          <img
            src="/images/pets_cute.png"
            alt="Cute pets"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }}
          />
        </div>
      </div>
    </section>
    </div>
  )
}
