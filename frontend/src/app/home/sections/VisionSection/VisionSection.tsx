const VISION_ITEMS = [
  'Find your perfect animal soulmate',
  'Built on data and trust',
  'Safe homes for every pet',
  'Smart matching for happy lives',
]

export default function VisionSection() {
  return (
    <section className="px-6 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <p
          className="font-semibold mb-2 tracking-widest text-center"
          style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}
        >
          We help...
        </p>
        <h2
          className="font-bold mb-14 text-center"
          style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)' }}
        >
          Our Vision
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
          {VISION_ITEMS.map((title, i) => (
            <div key={i} className="flex flex-col items-start">
              <p
                className="font-semibold leading-snug"
                style={{ color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: '1.4' }}
              >
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
