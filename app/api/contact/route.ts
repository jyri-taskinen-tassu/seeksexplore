import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const { name, email, phone, message, language } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All required fields are required' },
        { status: 400 }
      );
    }

    const subject = language === 'en' 
      ? 'Contact from Seeks & Explore Landing Page'
      : 'Yhteydenotto Seeks & Explore -sivulta';

    const emailBody = language === 'en'
      ? `Name: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\n\nMessage:\n${message}`
      : `Nimi: ${name}\nSähköposti: ${email}${phone ? `\nPuhelin: ${phone}` : ''}\n\nViesti:\n${message}`;

    const { data, error } = await resend.emails.send({
      from: 'Seeks & Explore <onboarding@resend.dev>', // Käytä testi-domainia aluksi
      to: [email], // Lähetä testissä lähettäjälle itselleen
      subject: subject,
      text: emailBody,
      replyTo: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
