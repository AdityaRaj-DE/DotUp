import { NextResponse } from 'next/server';

const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL ||
  'https://script.google.com/macros/s/AKfycbyeDrLSeniNxiGN7-8WNm1YvYIxSiusRjufmtgDV23M7kmH7d4bibgDqVhUQAyTGHVGCw/exec';

const PROJECT_ID = process.env.EMAIL_SERVICE_PROJECT_ID || 'dotup_v3';

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

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, code: 'MISSING_NAME', message: 'Please provide your name.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { success: false, code: 'MISSING_EMAIL', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return NextResponse.json(
        { success: false, code: 'MISSING_SUBJECT', message: 'Please provide a subject.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, code: 'MISSING_MESSAGE', message: 'Please enter your message.' },
        { status: 400 }
      );
    }

    const payload = {
      projectId: PROJECT_ID,
      type: 'contact',
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim()
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

