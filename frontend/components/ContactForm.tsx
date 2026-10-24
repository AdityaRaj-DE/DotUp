'use client';

import React, { useState } from 'react';
import AsciiGlitchText from './AsciiGlitchText';
import { CheckIcon } from './Icons';

// Standard email validation regex
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validate a single field
  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (field) {
      case 'name':
        if (!trimmed) return 'Name is required.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (trimmed.length > 100) return 'Name cannot exceed 100 characters.';
        return undefined;
      case 'email':
        if (!trimmed) return 'Email is required.';
        if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address (e.g., name@domain.com).';
        if (trimmed.length > 254) return 'Email cannot exceed 254 characters.';
        return undefined;
      case 'subject':
        if (!trimmed) return 'Subject is required.';
        if (trimmed.length < 3) return 'Subject must be at least 3 characters.';
        if (trimmed.length > 200) return 'Subject cannot exceed 200 characters.';
        return undefined;
      case 'message':
        if (!trimmed) return 'Message is required.';
        if (trimmed.length < 10) return 'Message must be at least 10 characters.';
        if (trimmed.length > 4000) return 'Message cannot exceed 4000 characters.';
        return undefined;
      default:
        return undefined;
    }
  };

  // Full form validation check
  const validateAll = (): boolean => {
    const nextErrors: FormErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      subject: validateField('subject', subject),
      message: validateField('message', message)
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleBlur = (field: keyof FormErrors, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof FormErrors, value: string) => {
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all as touched
    setTouched({ name: true, email: true, subject: true, message: true });

    if (!validateAll()) {
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
        setServerError(data.message || 'Failed to send message. Please try again.');
      } else {
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setTouched({});
        setErrors({});
      }
    } catch (err: any) {
      setServerError(err.message || 'Network error occurred. Please try again later.');
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
          {serverError && (
            <div className="contact-form-error" role="alert">
              <span>{serverError}</span>
            </div>
          )}

          {/* Honeypot field (hidden from real users, bots fill it out) */}
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
                onChange={(e) => {
                  setName(e.target.value);
                  handleChange('name', e.target.value);
                }}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="Ada Lovelace"
                className={`contact-field-input ${touched.name && errors.name ? 'contact-field-input-error' : ''}`}
                disabled={loading}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={touched.name && errors.name ? 'contact-name-error' : undefined}
              />
              {touched.name && errors.name && (
                <span id="contact-name-error" className="contact-field-error-msg">
                  {errors.name}
                </span>
              )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleChange('email', e.target.value);
                }}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="ada@example.com"
                className={`contact-field-input ${touched.email && errors.email ? 'contact-field-input-error' : ''}`}
                disabled={loading}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={touched.email && errors.email ? 'contact-email-error' : undefined}
              />
              {touched.email && errors.email && (
                <span id="contact-email-error" className="contact-field-error-msg">
                  {errors.email}
                </span>
              )}
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
              onChange={(e) => {
                setSubject(e.target.value);
                handleChange('subject', e.target.value);
              }}
              onBlur={(e) => handleBlur('subject', e.target.value)}
              placeholder="Collaboration / Question regarding DotUp"
              className={`contact-field-input ${touched.subject && errors.subject ? 'contact-field-input-error' : ''}`}
              disabled={loading}
              aria-invalid={touched.subject && !!errors.subject}
              aria-describedby={touched.subject && errors.subject ? 'contact-subject-error' : undefined}
            />
            {touched.subject && errors.subject && (
              <span id="contact-subject-error" className="contact-field-error-msg">
                {errors.subject}
              </span>
            )}
          </div>

          <div className="contact-form-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="contact-message" className="contact-field-label">
                Message <span className="contact-required">*</span>
              </label>
              <span className="contact-field-char-count">{message.length}/4000</span>
            </div>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleChange('message', e.target.value);
              }}
              onBlur={(e) => handleBlur('message', e.target.value)}
              placeholder="Hi Aditya, I had a thought regarding module architecture or would love to connect..."
              className={`contact-field-textarea ${touched.message && errors.message ? 'contact-field-input-error' : ''}`}
              disabled={loading}
              aria-invalid={touched.message && !!errors.message}
              aria-describedby={touched.message && errors.message ? 'contact-message-error' : undefined}
            />
            {touched.message && errors.message && (
              <span id="contact-message-error" className="contact-field-error-msg">
                {errors.message}
              </span>
            )}
          </div>

          <div className="contact-form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-hero-primary"
              style={{ minWidth: '150px', justifyContent: 'center' }}
            >
              <AsciiGlitchText text={loading ? 'Validating & Sending...' : 'Send Direct Message'} />
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
