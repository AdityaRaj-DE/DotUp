'use client';

import React, { useState } from 'react';
import AsciiGlitchText from './AsciiGlitchText';
import { CheckIcon } from './Icons';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website: website.trim() // honeypot
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send message. Please try again.');
      } else {
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      {success ? (
        <div className="contact-form-success" role="alert">
          <div className="contact-form-success-icon">
            <CheckIcon size={20} />
          </div>
          <div>
            <h4 className="contact-success-title">Message Sent Successfully!</h4>
            <p className="contact-success-desc">
              Thank you for reaching out. Your message has been routed to my inbox and I will reply as soon as possible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="btn-hero-secondary"
            style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
          >
            <AsciiGlitchText text="Send Another Message" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          {errorMessage && (
            <div className="contact-form-error" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Honeypot field (hidden from real users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="contact-form-grid">
            <div className="contact-form-field">
              <label htmlFor="contact-name" className="contact-field-label">
                Name <span className="contact-required">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adarsh"
                className="contact-field-input"
                disabled={loading}
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="contact-email" className="contact-field-label">
                Email <span className="contact-required">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@example.com"
                className="contact-field-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-subject" className="contact-field-label">
              Subject <span className="contact-required">*</span>
            </label>
            <input
              id="contact-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Collaboration / Question regarding DotUp"
              className="contact-field-input"
              disabled={loading}
            />
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-message" className="contact-field-label">
              Message <span className="contact-required">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi Aditya, I had a thought regarding module architecture or would love to connect..."
              className="contact-field-textarea"
              disabled={loading}
            />
          </div>

          <div className="contact-form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-hero-primary"
              style={{ minWidth: '150px', justifyContent: 'center' }}
            >
              <AsciiGlitchText text={loading ? 'Sending...' : 'Send Direct Message'} />
              <span>→</span>
            </button>
            <span className="contact-form-privacy-note">
              Routed securely via server-side email service. Zero third-party trackers.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

