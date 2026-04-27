import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const RECIPIENT = 'founder@sentiquant.org'
const FROM      = process.env.SMTP_USER ?? 'founder@sentiquant.org'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpPort = parseInt(process.env.SMTP_PORT ?? '587')

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('[contact] SMTP not configured')
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 })
    }

    const transporter = nodemailer.createTransport({
      host:   smtpHost,
      port:   smtpPort,
      secure: smtpPort === 465,
      auth:   { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from:    `"Sentiquant Contact" <${FROM}>`,
      to:      RECIPIENT,
      replyTo: email,
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#0f1117;padding:24px 32px;border-bottom:1px solid #1e2130">
            <span style="font-size:20px;font-weight:bold">⚡ SentiQuant</span>
            <p style="color:#8b8fa8;margin:4px 0 0;font-size:13px">Contact Form Submission</p>
          </div>
          <div style="padding:32px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#8b8fa8;padding:8px 0;width:120px;font-size:13px">Name</td><td style="color:#fff;font-size:13px">${name}</td></tr>
              <tr><td style="color:#8b8fa8;padding:8px 0;font-size:13px">Email</td><td style="color:#fff;font-size:13px"><a href="mailto:${email}" style="color:#06b6d4">${email}</a></td></tr>
              <tr><td style="color:#8b8fa8;padding:8px 0;font-size:13px">Subject</td><td style="color:#fff;font-size:13px">${subject}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#1e2130;border-radius:8px">
              <p style="color:#8b8fa8;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em">Message</p>
              <p style="color:#fff;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${message}</p>
            </div>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #1e2130;text-align:center">
            <p style="color:#8b8fa8;font-size:12px;margin:0">SentiQuant — AI Stock Analysis Platform</p>
          </div>
        </div>
      `,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Failed to send email:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
