import Link from 'next/link'

export default function HeroSection() {
  return (
    <section id="home" className="relative" style={{ minHeight: '100vh', zIndex: 1 }}>
      {/* Text overlay — background comes from the shared wrapper */}
      <div
        className="relative flex flex-col justify-end px-6 md:px-14"
        style={{ minHeight: '100vh', paddingTop: 'max(140px, 30vh)', paddingBottom: '20px' }}
      >
        <div style={{ maxWidth: '480px' }}>
          <p
            className="font-semibold mb-4"
            style={{ color: '#A8D5CC', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', letterSpacing: '0.12em' }}
          >
            WELCOME TO SNUGGLE
          </p>
          <h1
            className="font-bold mb-6"
            style={{ fontSize: 'clamp(28px, 5vw, 58px)', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'italic', lineHeight: 1.1 }}
          >
            LET'S FIND YOUR<br />PAWFECT MATCH!
          </h1>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.75', maxWidth: '380px' }}>
            Connecting loving families with pets who need a home. Browse, adopt, and build a bond that lasts a lifetime.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ padding: '13px 30px', borderRadius: '40px', backgroundColor: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}
            >
              Find a Pet
            </Link>
            <a
              href="#about-us"
              className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
              style={{ padding: '13px 30px', borderRadius: '40px', border: '1.5px solid rgba(255,255,255,0.8)', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
