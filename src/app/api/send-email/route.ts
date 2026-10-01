import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, type, otp, orderDetails, subject } = body;

    const targetEmail = to || 'ac5818204@gmail.com';

    // Get SMTP Configuration from environment variables
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.MAIL_USERNAME;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
    const from = process.env.SMTP_FROM || `"Gulmohar Footwear" <support@footweargulmohar.com>`;

    console.log(`[Email Dispatch Request] Sending ${type || 'email'} to ${targetEmail}...`);

    let emailHtml = '';
    let emailSubject = subject || 'Gulmohar Footwear Notification';

    if (type === 'otp') {
      emailSubject = subject || `[Gulmohar Footwear] Your Account Verification OTP: ${otp}`;
      emailHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden;">
          <div style="background: #0f1117; padding: 24px; text-align: center; border-bottom: 3px solid #e63946;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif;">GULMOHAR <span style="color: #e63946;">FOOTWEAR</span></h1>
            <p style="color: #f5d77f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Step Into Comfort, Walk In Style</p>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <h2 style="color: #1a1e2b; margin-top: 0;">Account Verification Code</h2>
            <p style="color: #555555; font-size: 14px; line-height: 1.6;">Hello,</p>
            <p style="color: #555555; font-size: 14px; line-height: 1.6;">Use the following One-Time Password (OTP) to complete your account registration or password reset. This code is valid for 10 minutes:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #d4af37; border-radius: 12px; padding: 16px; margin: 24px 0; display: inline-block;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e63946;">${otp}</span>
            </div>
            
            <p style="color: #888888; font-size: 12px; margin-top: 24px;">If you did not request this OTP code, please ignore this email.</p>
          </div>
          <div style="background: #f4f5f7; padding: 16px; text-align: center; font-size: 11px; color: #777777; border-t: 1px solid #eeeeee;">
            © ${new Date().getFullYear()} Gulmohar Footwear & Apparel. All Rights Reserved.<br/>
            Vadla RTO Road, Gujarat 364002, India | Phone: +91 98987 98322
          </div>
        </div>
      `;
    } else if (type === 'order') {
      emailSubject = subject || `[Gulmohar Order Confirmed] Invoice & Receipt for Order #${orderDetails?.orderId || 'ORD-9821'}`;
      emailHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden;">
          <div style="background: #0f1117; padding: 24px; text-align: center; border-bottom: 3px solid #e63946;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif;">GULMOHAR <span style="color: #e63946;">FOOTWEAR</span></h1>
            <p style="color: #f5d77f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmation & Invoice Receipt</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #27ae60; margin-top: 0;">✓ Thank You for Your Order!</h2>
            <p style="color: #444444; font-size: 14px; line-height: 1.6;">Your order <strong>#${orderDetails?.orderId || 'ORD-9821'}</strong> has been confirmed and is being prepared by our artisan team.</p>
            
            <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111;">Order Details:</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Recipient:</strong> ${orderDetails?.name || 'Customer'}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Email:</strong> ${targetEmail}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Delivery Address:</strong> ${orderDetails?.address || 'Vadla RTO Road, Gujarat'}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Total Amount:</strong> ₹${orderDetails?.total || '1,499'}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Payment Method:</strong> ${orderDetails?.paymentMethod || 'Cash On Delivery'}</p>
            </div>

            <p style="color: #555555; font-size: 13px;">Dispatch & AWB tracking link will be sent to your mobile via SMS once shipped.</p>
          </div>
          <div style="background: #f4f5f7; padding: 16px; text-align: center; font-size: 11px; color: #777777; border-t: 1px solid #eeeeee;">
            © ${new Date().getFullYear()} Gulmohar Footwear & Apparel. All Rights Reserved.<br/>
            Vadla RTO Road, Gujarat 364002, India | Support: +91 98987 98322
          </div>
        </div>
      `;
    }

    // If user provided SMTP credentials, send via real SMTP server
    if (user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      const mailOptions = {
        from,
        to: targetEmail,
        subject: emailSubject,
        html: emailHtml
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent Success] MessageID: ${info.messageId} to ${targetEmail}`);

      return NextResponse.json({
        success: true,
        sent: true,
        messageId: info.messageId,
        message: `Email dispatched successfully to ${targetEmail}`
      });
    }

    // Fallback simulation log when SMTP credentials are pending in .env
    console.log(`[Simulated Email Dispatch] Target: ${targetEmail} | OTP: ${otp || 'N/A'}`);

    return NextResponse.json({
      success: true,
      sent: false,
      simulated: true,
      targetEmail,
      otp,
      message: `Email request created for ${targetEmail}. Configure SMTP_USER and SMTP_PASS in .env.local to send live emails.`
    });

  } catch (err: any) {
    console.error('[Email Dispatch Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
