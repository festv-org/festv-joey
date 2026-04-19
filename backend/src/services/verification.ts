import { Resend } from 'resend';
import twilio from 'twilio';

// Lazy initialization - only create when needed
let resendInstance: Resend | null = null;
let twilioInstance: ReturnType<typeof twilio> | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

function getTwilio() {
  if (!twilioInstance) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }
    twilioInstance = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioInstance;
}

export async function sendEmailCode(email: string, code: string, firstName: string) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'Fêtes <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email - Fêtes',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px;">🍽️</span>
                </div>
                <h1 style="font-size: 24px; font-weight: bold; color: #1C1917; margin: 16px 0 0 0;">Fêtes</h1>
              </div>
              
              <div style="background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 16px; padding: 32px;">
                <h2 style="font-size: 20px; font-weight: 600; color: #1C1917; margin: 0 0 16px 0;">Hi ${firstName},</h2>
                <p style="font-size: 16px; color: #57534E; line-height: 24px; margin: 0 0 24px 0;">
                  Your verification code is:
                </p>
                <div style="background: #FFF7ED; border: 2px solid #FDBA74; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                  <div style="font-size: 36px; font-weight: bold; color: #EA580C; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </div>
                </div>
                <p style="font-size: 14px; color: #78716C; line-height: 20px; margin: 0;">
                  This code expires in <strong>15 minutes</strong>. If you didn't request this code, please ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 32px; padding-top: 32px; border-top: 1px solid #E7E5E4;">
                <p style="font-size: 12px; color: #A8A29E; margin: 0;">
                  © ${new Date().getFullYear()} Fêtes. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendSMSCode(phoneNumber: string, code: string) {
  try {
    const twilioClient = getTwilio();
    await twilioClient.messages.create({
      body: `Your Fêtes verification code is: ${code}. Expires in 15 minutes.`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error('Failed to send SMS verification code');
  }
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
