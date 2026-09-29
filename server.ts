import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// API route to send OTP (supports email linking verification and password reset)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp, name, type = 'verification' } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email dan kode OTP diperlukan.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const gmailUser = (process.env.GMAIL_USER || 'mhdalfinml@gmail.com').trim();
    const rawGmailPass = process.env.GMAIL_APP_PASSWORD || 'bvne dbbm xcuo mros';
    const gmailPass = rawGmailPass.replace(/\s+/g, '');

    const isReset = type === 'reset';
    const isUnlink = type === 'unlink';

    let emailSubject = `[KODE OTP: ${otp}] Verifikasi Akun Gmail - iPhone Inventory`;
    let emailTitle = 'Verifikasi Akun Gmail';
    let emailDescription = `Berikut adalah kode OTP verifikasi resmi untuk menautkan alamat Gmail (<strong>${cleanEmail}</strong>) ke akun sistem POS Anda:`;
    let emailFooter = 'Kode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun. Jika Anda tidak meminta kode ini, abaikan email ini.';

    if (isReset) {
      emailSubject = `[KODE RESET: ${otp}] Pemulihan Kata Sandi Akun - iPhone Inventory`;
      emailTitle = 'Pemulihan Kata Sandi Akun';
      emailDescription = `Kami menerima permintaan untuk mereset kata sandi akun sistem POS Anda. Gunakan kode OTP 6 digit berikut untuk membuat kata sandi baru untuk akun (<strong>${cleanEmail}</strong>):`;
      emailFooter = 'Kode ini berlaku selama 15 menit. Masukkan kode ini pada form pemulihan kata sandi di aplikasi. Jika Anda tidak meminta reset sandi, abaikan email ini dan akun Anda tetap aman.';
    } else if (isUnlink) {
      emailSubject = `[KODE OTP: ${otp}] Verifikasi Putus Tautan Email - iPhone Inventory`;
      emailTitle = 'Verifikasi Keamanan Putus Tautan Email';
      emailDescription = `Peringatan Keamanan: Kami menerima permintaan untuk memutuskan tautan alamat Gmail (<strong>${cleanEmail}</strong>) dari akun Anda. Masukkan kode OTP 6 digit berikut untuk mengonfirmasi pelepasan tautan:`;
      emailFooter = 'Kode ini berlaku selama 5 menit. PERINGATAN: Jangan berikan kode ini kepada siapapun! Jika Anda tidak meminta pelepasan tautan ini, akun Anda tetap aman dan jangan berikan kode kepada orang lain.';
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-top: 0; font-size: 20px;">iPhone POS & Inventory System</h2>
        <div style="display: inline-block; padding: 4px 10px; background-color: #eef2ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
          ${emailTitle}
        </div>
        <p style="color: #334155; font-size: 15px;">Halo <strong>${name || 'Pengguna'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          ${emailDescription}
        </p>
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0; line-height: 1.4;">
          ${emailFooter}
        </p>
      </div>
    `;

    // Mengirim email menggunakan Gmail SMTP (nodemailer)
    if (!gmailUser || !gmailPass) {
      return res.status(500).json({
        success: false,
        message: 'Konfigurasi Gmail SMTP belum diatur di server.',
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"iPhone POS System" <${gmailUser}>`,
        to: cleanEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      return res.json({
        success: true,
        message: `Kode ${isReset ? 'reset sandi' : 'OTP'} resmi berhasil dikirim ke ${cleanEmail}. Silakan periksa inbox / spam Gmail Anda!`,
      });
    } catch (gmailErr: any) {
      console.error('Nodemailer error:', gmailErr);
      return res.status(500).json({
        success: false,
        message: `Gagal mengirim email: ${gmailErr?.message || 'Terjadi kesalahan pada layanan Gmail SMTP.'}`,
      });
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses pengiriman email.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
