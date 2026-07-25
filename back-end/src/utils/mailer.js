import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dns from 'dns';

// Memprioritaskan IPv4 untuk koneksi jaringan
dns.setDefaultResultOrder('ipv4first');

// Inisialisasi Resend SDK jika API Key tersedia
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Transporter SMTP Cadangan (Nodemailer) jika Resend tidak dikonfigurasi
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.GOOGLE_MAIL_SERVER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

/**
 * Mengirim email OTP Verifikasi ke alamat tujuan.
 * @param {string} toEmail - Alamat email penerima
 * @param {string} otpCode - Kode OTP 6 digit
 */
export const sendOtpEmail = async (toEmail, otpCode) => {
  const senderEmail = process.env.MAIL_SENDER || 'noreply@nutricca.my.id';
  const from = `Nutricca Official <${senderEmail}>`;
  const subject = 'Verifikasi Akun Nutricca Kamu';

  // Versi Teks Polos (Wajib untuk menurunkan Spam Score)
  const textContent = `Halo,\n\nKode verifikasi (OTP) akun Nutricca kamu adalah: ${otpCode}\n\nKode ini hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.\n\nJika kamu tidak merasa mendaftar di Nutricca, silakan abaikan email ini.\n\nSalam,\nTim Nutricca`;

  // Versi HTML dengan Kerangka Standar W3C / MIME
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Akun Nutricca</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 20px 10px 20px;">
              <h2 style="color: #16a34a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Nutricca</h2>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Healthy Lifestyle & Nutrition Platform</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 20px 30px 30px 30px;">
              <div style="background-color: #f8fafc; padding: 24px; border-radius: 10px; text-align: center; border: 1px solid #f1f5f9;">
                <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">Kode Verifikasi (OTP)</h3>
                <p style="color: #475569; font-size: 15px; margin: 0 0 20px 0; line-height: 1.5;">Gunakan kode di bawah ini untuk mengonfirmasi pendaftaran akun Nutricca kamu:</p>
                
                <div style="background-color: #ffffff; border: 2px dashed #16a34a; padding: 16px; margin: 20px 0; border-radius: 10px; display: inline-block; width: 85%;">
                  <span style="font-size: 34px; font-weight: 800; color: #16a34a; letter-spacing: 10px; display: block; font-family: monospace;">${otpCode}</span>
                </div>
                
                <p style="color: #dc2626; font-size: 13px; margin: 15px 0 0 0; font-weight: 600;">⚠️ Kode ini rahasia dan hanya berlaku selama 5 menit.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0 30px 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 5px 0; line-height: 1.4;">
                Email ini dikirim secara otomatis oleh sistem Nutricca.<br>
                Jika kamu tidak mendaftar di Nutricca, abaikan email ini.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Nutricca (nutricca.my.id). All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Opsi 1: Kirim via Resend API (Prioritas Utama untuk Domain Kustom)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [toEmail],
        subject,
        text: textContent,
        html: htmlContent,
        replyTo: senderEmail,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        throw error;
      }

      console.log('✅ Email OTP terkirim via Resend ke:', toEmail, '| ID:', data?.id);
      return data;
    } catch (error) {
      console.warn('⚠️ Gagal mengirim via Resend API, mencoba fallback SMTP...');
    }
  }

  // Opsi 2: Fallback ke Nodemailer (SMTP) jika Resend tidak aktif atau error
  const mailOptions = {
    from,
    to: toEmail,
    replyTo: senderEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  const info = await smtpTransporter.sendMail(mailOptions);
  console.log('✅ Email OTP terkirim via SMTP ke:', toEmail, '| MessageId:', info.messageId);
  return info;
};
