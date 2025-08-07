// utils/sendOtpEmail.js
import resend from '../config/resendClient.js';

export async function sendOtpEmail(to, otp) {
  try {
    const response = await resend.emails.send({
      from: 'Tanvi <onboarding@resend.dev>', // or your verified domain email
      to: to,
      subject: 'Your OTP Verification Code',
      html: `<h2>Your OTP Code is: <strong>${otp}</strong></h2>
             <p>Use this to verify your email. This code is valid for 5 minutes.</p>`
    });

    console.log('📬 OTP email sent:', response);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    return { success: false, error };
  }
}
