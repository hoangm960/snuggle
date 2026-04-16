'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAV_LINKS = ['Home', 'About Us', 'Pets', 'eKYC', 'Contact']

const FOOTER_LINKS = [
  'About', 'Help Center', 'Terms of Service', 'Privacy Policy',
  'Cookie Policy', 'Accessibility', 'Careers', 'Marketing', 'Developers', 'Settings',
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')
    if (!email.trim()) {
      setEmailError('Email address or username is required')
      valid = false
    }
    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else if (password.length < 8) {
      setPasswordError('Your password must have at least 8 characters')
      valid = false
    }
    return valid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      const { token } = data.data
      localStorage.setItem('token', token)
      router.push('/')
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please try again.'
      setPasswordError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Full-width header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#CCCCCC] bg-white z-10 rounded-b-2xl">
        {/* Logo + Nav grouped left */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" viewBox="0 0 31 30" fill="none">
              <g clipPath="url(#clip0_27_1825)">
                <path d="M16.0487 15.4468C16.1192 15.4468 16.1192 15.4468 16.1912 15.4468C16.8975 15.4487 17.5488 15.49 18.2246 15.7032C18.2989 15.7244 18.3732 15.7456 18.4497 15.7675C19.5814 16.1186 20.3722 16.8432 21.1308 17.6953C21.1873 17.7574 21.2438 17.8194 21.3004 17.8814C21.7216 18.3463 22.1106 18.8294 22.4885 19.3278C22.5862 19.456 22.685 19.5834 22.784 19.7106C23.3147 20.3953 23.8076 21.1012 24.2935 21.8161C24.3849 21.9501 24.4773 22.0834 24.5706 22.2162C26.9735 25.6374 26.9735 25.6374 26.6704 27.6233C26.6309 27.7781 26.5826 27.9193 26.5195 28.0664C26.4982 28.1166 26.4769 28.1667 26.4549 28.2184C26.0945 28.9828 25.4627 29.4618 24.6593 29.7572C24.0552 29.9613 23.4703 30.0287 22.8332 30.0229C22.7091 30.022 22.5852 30.0229 22.4611 30.0241C21.7383 30.0253 21.0471 29.9205 20.3816 29.6411C20.3391 29.6239 20.2966 29.6066 20.2529 29.5888C19.8963 29.4392 19.5617 29.2585 19.2254 29.0707C17.6644 28.2012 15.5412 28.2393 13.8297 28.6453C13.4749 28.7507 13.1598 28.9028 12.8378 29.0797C11.7825 29.6548 10.8126 30.0109 9.58618 30.0173C9.49837 30.018 9.41056 30.0192 9.32277 30.0209C8.2315 30.0426 7.16503 29.8253 6.30062 29.1358C5.67623 28.5506 5.38814 27.8402 5.36012 27.0089C5.34996 26.031 5.63833 25.2829 6.1152 24.4336C6.15056 24.3702 6.18591 24.3067 6.22234 24.2414C7.42002 22.1606 8.82967 20.1049 10.414 18.2813C10.4632 18.2245 10.4632 18.2245 10.5134 18.1666C12.0261 16.4278 13.6464 15.441 16.0487 15.4468Z" fill="#EFC5BD"/>
                <path d="M22.25 0.537126C23.637 1.51311 24.3079 3.13418 24.6121 4.72132C24.697 5.27543 24.718 5.81991 24.7185 6.37934C24.7185 6.42236 24.7186 6.46538 24.7186 6.5097C24.7176 7.18558 24.683 7.83642 24.5217 8.49604C24.5061 8.56169 24.5061 8.56169 24.4902 8.62867C24.1333 10.0919 23.3983 11.546 22.0809 12.4145C21.3508 12.8325 20.5741 12.9345 19.7435 12.8043C19.5929 12.7656 19.4571 12.7172 19.3147 12.6562C19.2622 12.634 19.2098 12.6118 19.1557 12.5889C17.8297 11.9582 17.0603 10.655 16.5912 9.35461C15.8167 7.06649 16.0288 4.50232 17.0896 2.34003C17.6088 1.36226 18.3956 0.505556 19.4661 0.0914929C20.4408 -0.192237 21.4195 -0.00906445 22.25 0.537126Z" fill="#EFC5BD"/>
                <path d="M12.1673 0.396188C13.6803 1.40439 14.4007 3.06577 14.7275 4.76051C15.0999 6.89297 14.7651 9.22716 13.5627 11.0742C13.3935 11.3012 13.2122 11.5117 13.0178 11.7187C12.9831 11.7571 12.9483 11.7955 12.9125 11.835C12.3971 12.3732 11.6242 12.7977 10.8591 12.846C9.83877 12.8718 9.05292 12.61 8.29882 11.9284C7.14425 10.841 6.60057 9.36389 6.35763 7.85156C6.34639 7.78426 6.33515 7.71696 6.32357 7.64762C6.27484 7.25289 6.28233 6.85332 6.28194 6.45629C6.28188 6.41318 6.28182 6.37008 6.28176 6.32566C6.28241 5.64865 6.32063 4.99719 6.47872 4.33593C6.48747 4.29754 6.49622 4.25915 6.50524 4.2196C6.83398 2.80543 7.55416 1.29222 8.84005 0.468744C9.90809 -0.124147 11.0843 -0.229023 12.1673 0.396188Z" fill="#EFC5BD"/>
                <path d="M29.1838 9.6094C29.2475 9.64445 29.3111 9.67949 29.3768 9.7156C30.1234 10.2776 30.4761 10.9984 30.6369 11.8946C30.6872 12.7387 30.6877 13.5951 30.4553 14.4141C30.4387 14.474 30.4387 14.474 30.4217 14.5352C30.1255 15.5762 29.6043 16.5783 28.881 17.4024C28.8362 17.4538 28.7914 17.5052 28.7453 17.5582C27.9215 18.4727 26.9182 19.1601 25.6482 19.2925C24.987 19.3235 24.3723 19.1004 23.8859 18.6768C23.0021 17.7359 22.843 16.6868 22.8792 15.4489C22.9672 13.67 23.8864 11.9954 25.1271 10.7227C25.1626 10.6853 25.198 10.6479 25.2345 10.6094C26.1716 9.65359 27.8816 8.88535 29.1838 9.6094Z" fill="#EFC5BD"/>
                <path d="M5.07234 10.0548C5.35944 10.2567 5.61856 10.4838 5.87317 10.7226C5.92656 10.7678 5.92656 10.7678 5.98102 10.814C7.23278 11.9139 8.01844 13.8354 8.12307 15.4413C8.17676 16.617 8.01838 17.7219 7.17114 18.6218C7.12244 18.6641 7.07374 18.7064 7.02356 18.75C6.97985 18.7899 6.93615 18.8297 6.89111 18.8708C6.31444 19.2553 5.65556 19.355 4.97585 19.2373C3.55917 18.939 2.45326 17.9749 1.66088 16.8306C1.1646 16.077 0.783863 15.2769 0.545045 14.414C0.524597 14.342 0.504148 14.2699 0.48308 14.1957C0.24441 13.1892 0.210961 11.9854 0.605592 11.0156C0.626822 10.9621 0.648051 10.9086 0.669923 10.8536C0.93072 10.2822 1.41331 9.76026 2.00172 9.49445C3.07171 9.11379 4.17706 9.45232 5.07234 10.0548Z" fill="#EFC5BD"/>
              </g>
              <defs>
                <clipPath id="clip0_27_1825">
                  <rect width="31" height="30" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <span style={{ color: '#7AADA1', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 500 }}>
              Snuggle
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={link === 'Home' ? '/home' : link === 'eKYC' ? '/ekyc' : link === 'Pets' ? '/pets' : '#'}
                style={{ color: '#111', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 400 }}
                className="hover:opacity-70 transition-opacity"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: search + language */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Search box */}
          <div
            className="flex items-center gap-2"
            style={{
              padding: '8px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(102, 102, 102, 0.35)',
              background: '#F6F6F6',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <g clipPath="url(#clip0_115_453)">
                <path d="M10.3333 9.33333H9.80667L9.62 9.15333C10.2733 8.39333 10.6667 7.40667 10.6667 6.33333C10.6667 3.94 8.72667 2 6.33333 2C3.94 2 2 3.94 2 6.33333C2 8.72667 3.94 10.6667 6.33333 10.6667C7.40667 10.6667 8.39333 10.2733 9.15333 9.62L9.33333 9.80667V10.3333L12.6667 13.66L13.66 12.6667L10.3333 9.33333ZM6.33333 9.33333C4.67333 9.33333 3.33333 7.99333 3.33333 6.33333C3.33333 4.67333 4.67333 3.33333 6.33333 3.33333C7.99333 3.33333 9.33333 4.67333 9.33333 6.33333C9.33333 7.99333 7.99333 9.33333 6.33333 9.33333Z" fill="#666666" fillOpacity="0.8"/>
              </g>
              <defs>
                <clipPath id="clip0_115_453">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <input
              type="search"
              placeholder="Search..."
              className="bg-transparent outline-none w-28"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#333' }}
            />
          </div>

          {/* Language */}
          <button
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 400 }}
          >
            <GlobeIcon />
            <span>English (US)</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5" fill="none">
              <path d="M0 0L5 5L10 0H0Z" fill="#333333"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Middle row: image left + form right */}
      <div className="flex flex-1">
        {/* Left column — background image */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-shrink-0">
          <img
            src="/images/hero1.png"
            alt="Pets"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#7AACA1]/10" />
        </div>

        {/* Right column — form */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Form area */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
            <div className="w-full max-w-[420px]">
              <h1
                className="text-[26px] font-semibold text-[#333333] mb-2 leading-tight text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Log in
              </h1>

              {/* Sign up link — below heading */}
              <p className="text-xs text-center text-[#999999] mb-14">
                Don't have an account?{' '}
                <Link href="/register" style={{ color: '#7AADA1' }} className="font-medium hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Social login — Google first, then Facebook */}
              <div className="flex flex-col gap-5 mb-14">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full text-[#333333] text-sm font-medium hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
                  style={{
                    height: '48px',
                    borderRadius: '40px',
                    border: '1px solid #333',
                    background: '#FFF',
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full text-[#333333] text-sm font-medium hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
                  style={{
                    height: '48px',
                    borderRadius: '40px',
                    border: '1px solid #333',
                    background: '#FFF',
                  }}
                >
                  <FacebookIcon />
                  Continue with Facebook
                </button>
              </div>

              <div className="text-xs text-[#999999] text-center" style={{ border: 'none', marginTop: '12px', marginBottom: '12px' }}>
                Or continue with email
              </div>

              {/* Login form */}
              <form onSubmit={handleLogin} noValidate>
                {/* Email */}
                <div className="mb-9">
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Email address or username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                    placeholder="you@example.com"
                    style={{ paddingLeft: '20px', paddingRight: '16px' }}
                    className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                      ${emailError
                        ? 'border-[#EB4335] bg-red-50 focus:border-[#EB4335]'
                        : 'border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]'
                      }`}
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
                      <ErrorIcon />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-9">
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                      placeholder="••••••••"
                      style={{ paddingLeft: '20px', paddingRight: '56px' }}
                      className={`w-full h-10 rounded-[16px] border text-sm outline-none transition-colors
                        ${passwordError
                          ? 'border-[#EB4335] bg-red-50 focus:border-[#EB4335]'
                          : 'border-[#CCCCCC] bg-[#F6F6F6] focus:border-[#333333]'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#666666] hover:text-[#333333]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-[#EB4335] flex items-center gap-1">
                      <ErrorIcon />
                      {passwordError}
                    </p>
                  )}
                  {!passwordError && (
                    <p className="mt-1.5 text-xs text-[#666666]">
                      Your password must have at least 8 characters
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2" style={{ marginTop: '28px', marginBottom: '36px' }}>
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onChange={setRememberMe}
                  />
                  <label htmlFor="remember" className="text-xs text-[#666666] cursor-pointer">
                    Remember me
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center text-white text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{
                      width: '140px',
                      height: '48px',
                      padding: '12px 40px',
                      borderRadius: '16px',
                      backgroundColor: '#111',
                    }}
                  >
                    {loading ? 'Logging in…' : 'Log in'}
                  </button>
                </div>
              </form>

            </div>
          </main>
        </div>
      </div>

      {/* Full-width footer */}
      <footer className="px-8 py-6 border-t border-[#CCCCCC] bg-white">
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mb-3">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-[#666666] hover:text-[#333333] hover:underline"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-[#999999] text-center">© 2026 Snuggle</p>
      </footer>
    </div>
  )
}

/* ─── Small inline components ─── */

function Checkbox({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex-shrink-0 w-4 h-4 rounded-[3px] border-2 flex items-center justify-center transition-colors
        ${checked ? 'border-[#7AADA1]' : 'bg-white border-[#CCCCCC] hover:border-[#7AADA1]'}`}
      style={checked ? { backgroundColor: '#7AADA1' } : {}}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#0C82EE"/>
      <path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  )
}
