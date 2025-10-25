/**
 * Email Service Integration using Resend
 * https://resend.com/docs/send-with-nodejs
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'ContraMind.ai <onboarding@resend.dev>'; // Default Resend test email
// TODO: Update to your verified domain: 'ContraMind.ai <noreply@contramind.ai>'

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured - emails will be logged only');
    return null;
  }

  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }

  return resend;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const client = getResendClient();

  if (!client) {
    // Log email for development/testing
    console.log('[Email] Would send email:', {
      to: options.to,
      subject: options.subject,
      preview: options.text?.substring(0, 100) || options.html.substring(0, 100),
    });
    return true;
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to ContraMind.ai - AI-Powered Contract Analysis',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to ContraMind.ai</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${name}! Welcome ${name}!</h2>
              <p>Thank you for joining ContraMind.ai, the AI-powered contract analysis platform built specifically for Saudi Arabian businesses.</p>
              
              <h3>What You Can Do:</h3>
              <ul>
                <li>📄 Upload contracts in PDF or Word format</li>
                <li>🤖 Get AI-powered risk analysis in minutes</li>
                <li>✅ Check Sharia and KSA regulatory compliance</li>
                <li>💬 Chat with AI about your contracts</li>
                <li>📚 Build your knowledge base</li>
              </ul>

              <p>Your 14-day free trial starts now with full access to Professional features!</p>

              <a href="https://app.contramind.ai/dashboard" class="button">Get Started →</a>

              <p>If you have any questions, our support team is here to help.</p>

              <p>Best regards,<br>The ContraMind.ai Team</p>
            </div>
            <div class="footer">
              <p>ContraMind.ai - AI-Powered Contract Analysis for Saudi Arabia</p>
              <p>Built with ❤️ in KSA</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to ContraMind.ai, ${name}!\n\nThank you for joining our AI-powered contract analysis platform.\n\nGet started by uploading your first contract at https://app.contramind.ai/dashboard\n\nBest regards,\nThe ContraMind.ai Team`,
  });
}

/**
 * Send contract analysis complete notification
 */
export async function sendAnalysisCompleteEmail(
  email: string,
  name: string,
  contractName: string,
  riskScore: string
): Promise<boolean> {
  const riskColor = riskScore === 'low' ? '#10b981' : riskScore === 'medium' ? '#f59e0b' : '#ef4444';
  const riskEmoji = riskScore === 'low' ? '✅' : riskScore === 'medium' ? '⚠️' : '🚨';

  return sendEmail({
    to: email,
    subject: `Contract Analysis Complete: ${contractName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .risk-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; color: white; background: ${riskColor}; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✓ Analysis Complete</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We've completed the AI-powered analysis of your contract:</p>
              
              <p><strong>Contract:</strong> ${contractName}</p>
              <p><strong>Risk Assessment:</strong> <span class="risk-badge">${riskEmoji} ${riskScore.toUpperCase()}</span></p>

              <p>Your comprehensive analysis includes:</p>
              <ul>
                <li>Risk assessment and scoring</li>
                <li>Sharia compliance check</li>
                <li>KSA regulatory compliance</li>
                <li>Key terms and recommendations</li>
              </ul>

              <a href="https://app.contramind.ai/contracts" class="button">View Full Analysis →</a>

              <p>You can also chat with our AI assistant to ask specific questions about your contract.</p>

              <p>Best regards,<br>The ContraMind.ai Team</p>
            </div>
            <div class="footer">
              <p>ContraMind.ai - AI-Powered Contract Analysis</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nYour contract analysis for "${contractName}" is complete.\n\nRisk Score: ${riskScore.toUpperCase()}\n\nView the full analysis at https://app.contramind.ai/contracts\n\nBest regards,\nThe ContraMind.ai Team`,
  });
}

/**
 * Send support ticket reply notification
 */
export async function sendTicketReplyEmail(
  email: string,
  name: string,
  ticketNumber: string,
  message: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `New Reply on Support Ticket #${ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .message { background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">💬 New Reply on Your Ticket</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>You have a new reply on your support ticket <strong>#${ticketNumber}</strong>:</p>
              
              <div class="message">
                ${message}
              </div>

              <a href="https://app.contramind.ai/support" class="button">View Ticket →</a>

              <p>Log in to ContraMind.ai to view the full conversation and reply.</p>

              <p>Best regards,<br>The ContraMind.ai Support Team</p>
            </div>
            <div class="footer">
              <p>ContraMind.ai Support</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nYou have a new reply on support ticket #${ticketNumber}:\n\n${message}\n\nView and reply at https://app.contramind.ai/support\n\nBest regards,\nThe ContraMind.ai Support Team`,
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  tier: string,
  amount: number,
  billingCycle: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Subscription Confirmed - ContraMind.ai',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✓ Subscription Confirmed</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for subscribing to ContraMind.ai! Your subscription is now active.</p>
              
              <div class="details">
                <p><strong>Plan:</strong> ${tier}</p>
                <p><strong>Billing:</strong> ${amount} SAR / ${billingCycle}</p>
                <p><strong>Status:</strong> Active</p>
              </div>

              <p>You now have full access to all features in your plan. Start analyzing contracts with confidence!</p>

              <a href="https://app.contramind.ai/dashboard" class="button">Go to Dashboard →</a>

              <p>You can manage your subscription anytime from your account settings.</p>

              <p>Best regards,<br>The ContraMind.ai Team</p>
            </div>
            <div class="footer">
              <p>ContraMind.ai - AI-Powered Contract Analysis</p>
              <p>Questions? Contact us at support@contramind.ai</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nYour ${tier} subscription (${amount} SAR / ${billingCycle}) is now active!\n\nThank you for subscribing to ContraMind.ai.\n\nGet started at https://app.contramind.ai/dashboard\n\nBest regards,\nThe ContraMind.ai Team`,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  email: string,
  name: string,
  amount: number,
  currency: string,
  paymentDate: Date,
  invoiceNumber: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Payment Receipt - Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .invoice { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Payment Receipt</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for your payment. Here are your payment details:</p>
              
              <div class="invoice">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Amount Paid:</strong> ${amount} ${currency}</p>
                <p><strong>Payment Date:</strong> ${paymentDate.toLocaleDateString()}</p>
                <p><strong>Status:</strong> Paid ✓</p>
              </div>

              <p>This email serves as your receipt. Keep it for your records.</p>

              <p>Best regards,<br>The ContraMind.ai Team</p>
            </div>
            <div class="footer">
              <p>ContraMind.ai</p>
              <p>For billing questions, contact support@contramind.ai</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nPayment Receipt\n\nInvoice: ${invoiceNumber}\nAmount: ${amount} ${currency}\nDate: ${paymentDate.toLocaleDateString()}\nStatus: Paid\n\nThank you for your payment.\n\nBest regards,\nThe ContraMind.ai Team`,
  });
}

