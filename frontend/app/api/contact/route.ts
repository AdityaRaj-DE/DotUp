import { NextResponse } from 'next/server';

const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL ||
  'https://script.google.com/macros/s/AKfycbyeDrLSeniNxiGN7-8WNm1YvYIxSiusRjufmtgDV23M7kmH7d4bibgDqVhUQAyTGHVGCw/exec';

const PROJECT_ID = process.env.EMAIL_SERVICE_PROJECT_ID || 'dotup_v3';

// RFC 5322 regex
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot check: reject bots silently
    if (website && String(website).trim() !== '') {
      return NextResponse.json(
        { success: false, code: 'HONEYPOT_TRIGGERED', message: 'Bot activity detected.' },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, code: 'INVALID_NAME', message: 'Name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { success: false, code: 'NAME_TOO_LONG', message: 'Name cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, code: 'INVALID_EMAIL', message: 'Please provide a valid email address (e.g., name@domain.com).' },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 254) {
      return NextResponse.json(
        { success: false, code: 'EMAIL_TOO_LONG', message: 'Email address cannot exceed 254 characters.' },
        { status: 400 }
      );
    }

    if (!trimmedSubject || trimmedSubject.length < 3) {
      return NextResponse.json(
        { success: false, code: 'INVALID_SUBJECT', message: 'Subject must be at least 3 characters.' },
        { status: 400 }
      );
    }

    if (trimmedSubject.length > 200) {
      return NextResponse.json(
        { success: false, code: 'SUBJECT_TOO_LONG', message: 'Subject cannot exceed 200 characters.' },
        { status: 400 }
      );
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return NextResponse.json(
        { success: false, code: 'INVALID_MESSAGE', message: 'Message must be at least 10 characters.' },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 4000) {
      return NextResponse.json(
        { success: false, code: 'MESSAGE_TOO_LONG', message: 'Message cannot exceed 4000 characters.' },
        { status: 400 }
      );
    }

    const payload = {
      projectId: PROJECT_ID,
      type: 'contact',
      data: {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        subject: trimmedSubject,
        message: trimmedMessage
      }
    };

    const upstreamResponse = await fetch(EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok || data.success === false) {
      return NextResponse.json(
        {
          success: false,
          code: data.code || 'UPSTREAM_ERROR',
          message: data.message || 'Failed to deliver message via email service.'
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: data.jobId,
      message: 'Your message has been sent successfully. I will get back to you shortly!'
    });
  } catch (error: any) {
    console.error('Email API route error:', error);
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error while processing contact form.'
      },
      { status: 500 }
    );
  }
}
