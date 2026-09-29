/**
 * Real Email Dispatch Service for OTP Verification via Resend
 */

export interface SendEmailOtpResult {
  success: boolean;
  message: string;
}

export async function dispatchRealEmailOtp(
  email: string,
  otpCode: string,
  userName: string,
  type: 'verification' | 'reset' | 'unlink' = 'verification'
): Promise<SendEmailOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        otp: otpCode,
        name: userName,
        type,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || `Kode OTP resmi telah dikirim ke alamat email ${cleanEmail}. Periksa kotak masuk atau spam Gmail Anda.`,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Gagal mengirim email OTP.',
      };
    }
  } catch (error: any) {
    console.warn('[EmailService] Error calling /api/send-otp:', error);
    return {
      success: false,
      message: 'Koneksi ke server pengiriman email terganggu.',
    };
  }
}
