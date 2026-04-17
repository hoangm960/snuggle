export default function AboutUsSection() {
  return (
    <section id="about-us" className="relative" style={{ zIndex: 1 }}>

      {/* bg1.svg — sits at the bottom of the section, overflows into stats below */}
      <img
        src="/images/decorate/bg1.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-210px',
          left: '50%',
          transform: 'translateX(-50%) scaleY(80%)',
          width: 'max(1440px, 100%)',
          height: 'auto',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Text — left-aligned, photo shows through on the right */}
      <div
        className="relative flex flex-col justify-center px-6 md:px-10 lg:px-20 pt-40 pb-0 w-full lg:w-[52%]"
        style={{ zIndex: 1 }}
      >
        <p
          className="font-semibold mb-3 tracking-widest"
          style={{ color: '#7AADA1', fontSize: '11px', letterSpacing: '0.14em' }}
        >
          ABOUT US
        </p>
        <h2
          className="mb-5"
          style={{ color: '#216959', fontFamily: "'Francois One', sans-serif", fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 400, lineHeight: '1.2' }}
        >
          Smart Matching for Happy Lives
        </h2>
        <p className="leading-relaxed mb-8" style={{ color: '#3D2C1E', fontSize: '14px', maxWidth: '420px' }}>
          Snuggle is a data-driven pet adoption platform dedicated to creating perfect matches. By combining lifestyle
          algorithms with secure identity verification, we ensure every pet finds their true forever home. Find your
          perfect animal soulmate.
        </p>
        <a
          href="#pets"
          className="inline-flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
          style={{ padding: '11px 28px', borderRadius: '8px', border: '1.5px solid #3D2C1E', color: '#3D2C1E', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', alignSelf: 'flex-start' }}
        >
          Learn More
        </a>
      </div>

    </section>
  )
}
