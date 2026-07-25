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
  <title>Verifikasi Akun Nutricca - Kode OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Container Utama -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-radius: 8px;">
          
          <!-- Header (Logo Section) -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 30px 20px 20px 20px;">
              <img src="https://res.cloudinary.com/dvhh2li6s/image/upload/v1784986031/favicon_kqytm4.svg" alt="Nutricca" width="100" style="display: block; border: 0; max-width: 100%; height: auto;" />
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 40px 40px 40px;">
              <p style="color: #333333; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
                Halo Pengguna,
              </p>
              
              <p style="color: #333333; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
                Berikut adalah kode verifikasi Anda untuk pendaftaran akun Nutricca:
              </p>
              
              <!-- OTP Code -->
              <div style="margin: 30px 0;">
                <span style="font-size: 42px; font-weight: 700; color: #16a34a; letter-spacing: 4px; display: block;">${otpCode}</span>
              </div>
              
              <p style="color: #333333; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
                Kode ini valid selama 5 menit dan hanya bisa digunakan sekali.
              </p>
              
              <p style="color: #333333; font-size: 15px; margin: 0 0 40px 0; line-height: 1.6;">
                Jika Anda tidak merasa melakukan pendaftaran di Nutricca, mohon abaikan email ini.
              </p>
              
              <p style="color: #333333; font-size: 15px; margin: 0; line-height: 1.6;">
                Best Regards,<br>
                Nutricca Team
              </p>
            </td>
          </tr>
          
          <!-- Footer Information Section -->
          <tr>
            <td style="background-color: #2b2b2b; padding: 30px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #a0a0a0; font-size: 13px; line-height: 1.8;">
                    <a href="https://www.nutricca.web.id" style="color: #16a34a; text-decoration: none;">www.nutricca.web.id</a>
                    <br><br>
                    Jika ada kendala hubungi developer melalui email:<br>
                    <a href="mailto:nutriccaofficial@gmail.com" style="color: #ffffff; text-decoration: none;">nutriccaofficial@gmail.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Copyright Footer -->
          <tr>
            <td style="background-color: #222222; padding: 15px 40px; text-align: center;">
              <p style="color: #777777; font-size: 12px; margin: 0;">
                Copyright &copy; ${new Date().getFullYear()} Nutricca. All rights reserved.
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

      console.log(
        '✅ Email OTP terkirim via Resend ke:',
        toEmail,
        '| ID:',
        data?.id,
      );
      return data;
    } catch (error) {
      console.warn(
        '⚠️ Gagal mengirim via Resend API, mencoba fallback SMTP...',
      );
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
  console.log(
    '✅ Email OTP terkirim via SMTP ke:',
    toEmail,
    '| MessageId:',
    info.messageId,
  );
  return info;
};
