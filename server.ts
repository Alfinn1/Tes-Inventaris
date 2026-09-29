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

// Serve static robots.txt and sitemap.xml explicitly
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\n\nSitemap: https://iphonerepairmedan.com/sitemap.xml\n');
});

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://iphonerepairmedan.com/</loc>\n    <lastmod>2026-09-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n');
});

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

    let emailSubject = `${otp} adalah kode verifikasi iPhone Repair Medan Anda`;
    let emailTitle = 'Verifikasi Akun';
    let emailDescription = `Berikut adalah kode verifikasi OTP resmi untuk menghubungkan akun email (<strong>${cleanEmail}</strong>) pada sistem iPhone Repair Medan:`;
    let plainDescription = `Berikut adalah kode verifikasi OTP resmi untuk menghubungkan akun email (${cleanEmail}) pada sistem iPhone Repair Medan:`;
    let emailFooter = 'Kode verifikasi ini berlaku selama 5 menit. Demi keamanan, jangan pernah membagikan kode ini kepada siapa pun.';

    if (isReset) {
      emailSubject = `${otp} adalah kode reset kata sandi akun iPhone Repair Medan Anda`;
      emailTitle = 'Reset Kata Sandi Akun';
      emailDescription = `Kami menerima permintaan untuk mengatur ulang kata sandi akun sistem Anda (<strong>${cleanEmail}</strong>). Gunakan kode verifikasi berikut:`;
      plainDescription = `Kami menerima permintaan untuk mengatur ulang kata sandi akun sistem Anda (${cleanEmail}). Gunakan kode verifikasi berikut:`;
      emailFooter = 'Kode verifikasi ini berlaku selama 15 menit. Jika Anda tidak meminta reset sandi, abaikan pesan ini dan kata sandi Anda tetap aman.';
    } else if (isUnlink) {
      emailSubject = `${otp} adalah kode konfirmasi pelepasan email iPhone Repair Medan`;
      emailTitle = 'Konfirmasi Pelepasan Email';
      emailDescription = `Kami menerima konfirmasi untuk melepaskan tautan akun email (<strong>${cleanEmail}</strong>) dari sistem inventaris:`;
      plainDescription = `Kami menerima konfirmasi untuk melepaskan tautan akun email (${cleanEmail}) dari sistem inventaris:`;
      emailFooter = 'Kode verifikasi ini berlaku selama 5 menit. Jika bukan Anda yang meminta tindakan ini, segera periksa keamanan akun Anda.';
    }

    const emailText = `Halo ${name || 'Pengguna'},\n\n${plainDescription}\n\nKODE VERIFIKASI ANDA: ${otp}\n\n${emailFooter}\n\nSalam,\nTim iPhone Repair Medan`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
          Kode verifikasi Anda adalah ${otp}. Berlaku selama 5 menit.
        </div>
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="background-color: #4f46e5; padding: 20px 24px; text-align: left;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
              iPhone Repair Medan
            </h1>
            <p style="color: #c7d2fe; margin: 4px 0 0 0; font-size: 12px;">Sistem Pengelolaan Inventaris & Kasir</p>
          </div>
          
          <div style="padding: 28px 24px;">
            <div style="display: inline-block; padding: 4px 10px; background-color: #eef2ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
              ${emailTitle}
            </div>
            
            <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Halo <strong>${name || 'Pengguna'}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              ${emailDescription}
            </p>
            
            <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 18px; border-radius: 12px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 6px; font-weight: 600;">Kode Verifikasi</div>
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #1e293b; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0;">
              ${emailFooter}
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              Email otomatis dari Sistem Inventaris iPhone Repair Medan.<br>Mohon tidak membalas email ini secara langsung.
            </p>
          </div>
        </div>
      </body>
      </html>
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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      await transporter.sendMail({
        from: `"iPhone Repair Medan" <${gmailUser}>`,
        to: cleanEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Auto-Submitted': 'auto-generated',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
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
