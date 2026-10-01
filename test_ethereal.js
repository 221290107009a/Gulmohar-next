const nodemailer = require('nodemailer');

async function main() {
  console.log('--- GENERATING LIVE TEST EMAIL PREVIEW ---');
  let testAccount = await nodemailer.createTestAccount();

  console.log('Temporary Test Mailbox Created:', testAccount.user);

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 1. Send Account OTP Verification Email
  let info1 = await transporter.sendMail({
    from: '"Gulmohar Footwear" <footweargulmohar@gmail.com>',
    to: 'ac5818204@gmail.com',
    subject: '[Gulmohar Footwear] Your Account Verification OTP Code: 894021',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #0f1117; padding: 24px; text-align: center; border-bottom: 3px solid #e63946;">
          <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif;">GULMOHAR <span style="color: #e63946;">FOOTWEAR</span></h1>
          <p style="color: #f5d77f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Step Into Comfort, Walk In Style</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="color: #1a1e2b; margin-top: 0;">Account Verification Code</h2>
          <p style="color: #555555; font-size: 14px;">Hello,</p>
          <p style="color: #555555; font-size: 14px;">Your verification OTP code for account creation / password reset is:</p>
          
          <div style="background: #f8f9fa; border: 2px dashed #d4af37; border-radius: 12px; padding: 16px; margin: 24px 0; display: inline-block;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e63946;">894021</span>
          </div>
          
          <p style="color: #888888; font-size: 12px;">Valid for 10 minutes. Please do not share this OTP with anyone.</p>
        </div>
        <div style="background: #f4f5f7; padding: 16px; text-align: center; font-size: 11px; color: #777777;">
          © 2026 Gulmohar Footwear & Apparel. All Rights Reserved.<br/>Vadla RTO Road, Gujarat 364002, India
        </div>
      </div>
    `
  });

  console.log('\n[1/2 SUCCESS] Verification OTP Email Dispatched!');
  console.log('👉 CLICK TO VIEW OTP EMAIL IN BROWSER:');
  console.log(nodemailer.getTestMessageUrl(info1));

  // 2. Send Order Confirmation Email
  let info2 = await transporter.sendMail({
    from: '"Gulmohar Footwear" <footweargulmohar@gmail.com>',
    to: 'ac5818204@gmail.com',
    subject: '[Gulmohar Order Confirmed] Invoice & Receipt for Order #GM-749201',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #0f1117; padding: 24px; text-align: center; border-bottom: 3px solid #e63946;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif;">GULMOHAR <span style="color: #e63946;">FOOTWEAR</span></h1>
          <p style="color: #f5d77f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Official Invoice & Receipt</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #27ae60; margin-top: 0;">✓ Thank You for Your Order!</h2>
          <p style="color: #444444; font-size: 14px;">Your order <strong>#GM-749201</strong> has been placed successfully.</p>
          
          <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111;">Order Summary:</h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Customer Name:</strong> Yousaf Khan</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Email Address:</strong> ac5818204@gmail.com</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Shipping Address:</strong> Gulmohar Footwear, Vadla RTO Road, Gujarat 364002</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Item Purchased:</strong> Handcrafted Artisan Kolhapuri Mojari (Size: UK 7)</p>
            <p style="margin: 4px 0; font-size: 13px; color: #e63946;"><strong>Total Paid:</strong> ₹1,499</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Payment Mode:</strong> Cash On Delivery (Verified)</p>
          </div>
          <p style="color: #666666; font-size: 12px;">A tracking link will be sent to your mobile once dispatched.</p>
        </div>
        <div style="background: #f4f5f7; padding: 16px; text-align: center; font-size: 11px; color: #777777;">
          © 2026 Gulmohar Footwear & Apparel. All Rights Reserved.<br/>Support Helpline: +91 98987 98322
        </div>
      </div>
    `
  });

  console.log('\n[2/2 SUCCESS] Order Confirmation Invoice Email Dispatched!');
  console.log('👉 CLICK TO VIEW ORDER INVOICE EMAIL IN BROWSER:');
  console.log(nodemailer.getTestMessageUrl(info2));
}

main();
