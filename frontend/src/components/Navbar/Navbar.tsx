"use client";

import { useState } from "react";
import Link from "next/link";
import { PawLogo, SearchIcon, GlobeIcon } from "@/assets/icons";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = ["Home", "About Us", "Pets", "eKYC", "Contact"];

export type NavbarVariant = "overlay" | "static";

export interface NavbarProps {
  variant?: NavbarVariant;
  activeLink?: string;
  showAuthButtons?: boolean;
}

function navHref(link: string): string {
  if (link === "eKYC") return "/ekyc";
  if (link === "Pets") return "/pets";
  if (link === "Home") return "/home";
  return `#${link.toLowerCase().replace(" ", "-")}`;
}

export default function Navbar({
  variant = "static",
  activeLink,
  showAuthButtons = true,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/home";
  };

  const isOverlay = variant === "overlay";

  return (
    <>
      <header
        className={`flex items-center justify-between px-6 md:px-10 py-4 ${
          isOverlay ? "rounded-b-2xl" : ""
        }`}
        style={{
          background: "#fff",
          borderBottom: "1px solid #E8E8E8",
          position: isOverlay ? "absolute" : "relative",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        <Link href="/home" className="flex items-center gap-2">
          <PawLogo />
          <span
            style={{
              color: "#7AADA1",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "24px",
              fontWeight: 500,
            }}
          >
            Snuggle
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link;
            return (
              <Link
                key={link}
                href={navHref(link)}
                style={{
                  color: isActive ? "#7AADA1" : "#111",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "15px",
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? "2px solid #7AADA1" : "none",
                  paddingBottom: isActive ? "2px" : "0",
                }}
                className="hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {link}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div
            className="flex items-center gap-2"
            style={{
              padding: "8px 16px",
              borderRadius: "16px",
              border: "1px solid rgba(102,102,102,0.35)",
              background: "#F6F6F6",
            }}
          >
            <SearchIcon />
            <input
              type="search"
              placeholder="Search..."
              className="bg-transparent outline-none w-28"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                color: "#333",
              }}
            />
          </div>
          <button
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{
              color: "#333",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <GlobeIcon />
            <span style={{ margin: "0 2px" }}>English (US)</span>
            <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
              <path d="M0 0L5 5L10 0H0Z" fill="#333" />
            </svg>
          </button>

          {showAuthButtons ? (
            isOverlay && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity"
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    padding: "0 12px",
                    border: "1px solid #7AADA1",
                    color: "#7AADA1",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  <span>{user.displayName || user.email?.split("@")[0]}</span>
                  <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
                    <path d="M0 0L5 5L10 0H0Z" fill="#7AADA1" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 py-2 rounded-lg shadow-lg"
                    style={{
                      background: "#fff",
                      minWidth: "160px",
                      border: "1px solid #E8E8E8",
                    }}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-50"
                      style={{ color: "#333", fontSize: "14px" }}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/applications"
                      className="block px-4 py-2 hover:bg-gray-50"
                      style={{ color: "#333", fontSize: "14px" }}
                    >
                      My Applications
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                      style={{ color: "#EB4335", fontSize: "14px" }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
                  style={{
                    width: "98px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#7AADA1",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center font-medium hover:opacity-80 transition-opacity"
                  style={{
                    width: "98px",
                    height: "40px",
                    borderRadius: "8px",
                    border: "1px solid #111",
                    color: "#111",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  Sign up
                </Link>
              </>
            )
          ) : null}
        </div>

        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen((o) => !o)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "#333",
              borderRadius: "2px",
              transform: mobileMenuOpen ? "translateY(6px) rotate(45deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "#333",
              borderRadius: "2px",
              opacity: mobileMenuOpen ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "#333",
              borderRadius: "2px",
              transform: mobileMenuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </header>

      {mobileMenuOpen && (
        <div
          className="lg:hidden flex flex-col px-6 py-6 gap-5 bg-white border-b border-[#E8E8E8]"
          style={{
            position: isOverlay ? "absolute" : "relative",
            top: isOverlay ? "72px" : 0,
            left: 0,
            right: 0,
            zIndex: 15,
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link;
            return (
              <Link
                key={link}
                href={navHref(link)}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: isActive ? "#7AADA1" : "#111",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "16px",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {link}
              </Link>
            );
          })}
          {showAuthButtons && (
            <div className="flex gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center text-white font-medium"
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#7AADA1",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center font-medium"
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid #111",
                  color: "#111",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}