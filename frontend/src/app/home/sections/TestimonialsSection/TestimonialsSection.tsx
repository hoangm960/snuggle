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
  {
    name: 'Hearts of Taras',
    role: 'Adopter',
    text: 'Best adoption app out there, period. If you are looking for a sign to find your new bestie, this is it. Secure, beautiful, and super easy to use. Highly recommend!',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="px-6 md:px-10 lg:px-20 py-30 md:py-40" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-semibold mb-2 tracking-widest text-center"
          style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}
        >
          Feedback
        </p>
        <h2
          className="font-bold mb-12 text-center"
          style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 28px)' }}
        >
          What Our Partners Say About Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TESTIMONIALS.map(t => (
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
  )
}
