import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const testMailing = async () => {
  try {
    // 2. Import file mailer secara dinamis di dalam fungsi, 
    // agar ia baru dieksekusi SETELAH dotenv memuat variabel env
    const { sendOtpEmail } = await import('../src/utils/mailer.js');

    console.log('Mencoba mengirim email...');
    
    // Mari kita buktikan kalau emailnya sudah tidak undefined
    console.log('Sender Email:', process.env.GOOGLE_MAIL_SERVER); 

    // Ganti dengan email pribadimu sebagai penerima
    await sendOtpEmail('stevevai20242023@gmail.com', '123456');
    console.log('✅ Email berhasil terkirim! Cek kotak masukmu.');
  } catch (error) {
    console.error('❌ Gagal mengirim email:', error);
  }
};

testMailing();