'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AsciiGlitchText from './AsciiGlitchText';
import { motion } from 'framer-motion';

interface NavbarProps {
  backendStatus?: string;
  databaseStatus?: string;
}

export default function Navbar({ backendStatus, databaseStatus }: NavbarProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isHowToUse = pathname === '/how-to-use';
  const isAbout = pathname === '/about';
  const isDeveloper = pathname === '/meet-the-developer' || pathname === '/developer';

  return (
    <header className="ascii-navbar">
      {/* Left Side: Brand Logo with gradient border + horizontal links */}
      <div className="navbar-left">
        <Link href="/" className="navbar-brand-link">
          {/* DotUp Prismatic 'd' Brand Icon */}
          <svg className="brand-logo-svg" width="22" height="22" viewBox="0 0 512 512" fill="none" aria-hidden="true">
            <rect width="512" height="512" rx="112" fill="#12151d" />
            <rect width="510" height="510" x="1" y="1" rx="111" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="2" />
            <g fill="url(#nav-dotup-spectrum)">
              <rect x="326.6" y="64.4" width="88.2" height="88.2" rx="14" transform="rotate(45 370.7 108.5)" />
              <rect x="172.1" y="202.9" width="88.2" height="88.2" rx="14" transform="rotate(45 216.2 247.0)" />
              <rect x="326.6" y="205.8" width="88.2" height="88.2" rx="14" transform="rotate(45 370.7 249.9)" />
              <rect x="249.3" y="280.1" width="88.2" height="88.2" rx="14" transform="rotate(45 293.4 324.2)" />
              <rect x="96.8" y="280.1" width="88.2" height="88.2" rx="14" transform="rotate(45 140.9 324.2)" />
              <rect x="171.9" y="354.4" width="88.2" height="88.2" rx="14" transform="rotate(45 216.0 398.5)" />
              <rect x="326.7" y="359.2" width="88.2" height="88.2" rx="14" transform="rotate(45 370.8 403.3)" />
            </g>
            <defs>
              <linearGradient id="nav-dotup-spectrum" x1="90%" y1="10%" x2="10%" y2="90%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="28%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#8b5cf6" />
                <stop offset="85%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-title">
            <AsciiGlitchText text="dotup" />
          </span>
          <span className="brand-version-tag">v3.0 · open source</span>
        </Link>

        <nav className="navbar-nav-links" aria-label="Main Navigation">
          {[
            { href: '/', label: 'Home', active: isHome },
            { href: '/how-to-use', label: 'How to Use', active: isHowToUse },
            { href: '/about', label: 'About', active: isAbout },
            { href: '/meet-the-developer', label: 'Meet the Developer', active: isDeveloper }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${item.active ? 'nav-link-active' : ''}`}
            >
              {item.active && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className="nav-link-active-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="nav-link-text">
                <AsciiGlitchText text={item.label} />
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Right Side: GitHub Pill */}
      <div className="navbar-right">
        <a
          href="https://github.com/AdityaRaj-DE/DotUp"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-github-pill"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <AsciiGlitchText text="GitHub" />
        </a>
      </div>
    </header>
  );
}
