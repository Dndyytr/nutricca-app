import nodemailer from 'nodemailer';
import dns from 'dns'; // <-- JANGAN LUPA TAMBAHKAN INI

// Paksa Node.js memprioritaskan IPv4
dns.setDefaultResultOrder('ipv4first');

// Membuat konfigurasi pengirim (transporter)
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port:  2525,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

// Fungsi untuk mengirim OTP
export const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: `"Nutricca Official" <${process.env.GOOGLE_MAIL_SERVER}>`, // Nama pengirim yang muncul di kotak masuk
    to: toEmail,
    subject: 'Verifikasi Akun Nutricca Kamu 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #16a34a; margin: 0;">Nutricca</h2>
          <p style="color: #64748b; margin: 5px 0 0 0;">Healthy Lifestyle Platform</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="color: #0f172a; margin-top: 0;">Kode Verifikasi (OTP)</h3>
          <p style="color: #334155; font-size: 16px;">Gunakan kode di bawah ini untuk melanjutkan pendaftaran akun kamu.</p>
          <div style="background-color: #ffffff; border: 2px dashed #16a34a; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px;">${otpCode}</span>
          </div>
          <p style="color: #ef4444; font-size: 14px;">Kode ini hanya berlaku selama 5 menit.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          Jika kamu tidak merasa mendaftar di Nutricca, abaikan email ini.
        </p>
      </div>
    `,
  };

  // Eksekusi pengiriman email
  await transporter.sendMail(mailOptions);
};
