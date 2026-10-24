import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AsciiRevealText from '../../components/AsciiRevealText';
import AsciiGlitchText from '../../components/AsciiGlitchText';

export const metadata = {
  title: 'About DotUp - Reproducible Workstation Setup',
  description: 'A better way to set up your development environment. Choose your tools, configure your stack, and generate a setup you can reuse.'
};

export default function AboutPage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-content-flow">
          {/* 01 / HERO */}
          <div className="hero-ascii-frame">
            <span className="crosshair crosshair-tl" />
            <span className="crosshair crosshair-tr" />
            <span className="crosshair crosshair-bl" />
            <span className="crosshair crosshair-br" />

            <div className="hero-top-row">
              <div className="hero-pill-badge">
                <span className="badge-new">01 / ABOUT</span>
                <span>Open Source Developer Tooling</span>
              </div>

              <div className="hero-actions-right">
                <Link href="/" className="btn-hero-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                  <AsciiGlitchText text="Configure Stack" />
                  <span>→</span>
                </Link>
              </div>
            </div>

            <h1 className="hero-headline">
              <AsciiRevealText text="A better way to set up your development environment." preset="decode" speed={16} />
            </h1>
            <p className="hero-lead">
              DotUp is an open-source tool for building development environments your way. Choose your tools, configure your stack, and generate a setup you can reuse instead of starting from scratch every time.
            </p>
          </div>

          {/* 02 / THE PROBLEM */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="02 / The Problem" preset="blueprint" />
              </span>
              <h2 className="page-section-title">A new machine shouldn&apos;t mean starting over.</h2>
              <p className="page-section-desc">
                Installing runtimes, configuring tools, selecting versions, and recreating familiar settings can turn a clean machine into hours of repetitive work. DotUp aims to make that process structured, customizable, and repeatable.
              </p>
            </div>
          </section>

          {/* 03 / PHILOSOPHY */}
          <section className="page-section-card" data-ascii="surface">
            <div className="page-section-header">
              <span className="page-section-tagline">
                <AsciiRevealText text="03 / Philosophy" preset="blueprint" />
              </span>
              <h2 className="page-section-title">Built around developer control.</h2>
              <p className="page-section-desc">
                Engineering principles that describe behavior the implementation actually supports:
              </p>
            </div>

            <div className="philosophy-list">
              <div className="philosophy-item">
                <span className="philosophy-bullet">01</span>
                <div className="philosophy-content">
                  <h3 className="philosophy-title">Configuration over repetition</h3>
                  <p className="philosophy-desc">Define what you need declaratively rather than relying on memory or brittle manual steps.</p>
                </div>
              </div>

              <div className="philosophy-item">
                <span className="philosophy-bullet">02</span>
                <div className="philosophy-content">
                  <h3 className="philosophy-title">Reproducibility over guesswork</h3>
                  <p className="philosophy-desc">Keep a single configuration spec you can refer back to and reuse across multiple workstations.</p>
                </div>
              </div>

              <div className="philosophy-item">
                <span className="philosophy-bullet">03</span>
                <div className="philosophy-content">
                  <h3 className="philosophy-title">Open source over lock-in</h3>
                  <p className="philosophy-desc">Inspect the implementation, audit installation scripts, and contribute to its evolution freely.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
