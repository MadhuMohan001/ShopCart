import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmation = async (to, order) => {
  const itemsHtml = order.orderItems.map(
    (item) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
    </tr>`
  ).join('');

  await transporter.sendMail({
    from: `"ShopCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#333;">Your order is confirmed! 🎉</h2>
        <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;">Product</th>
              <th style="padding:8px;">Qty</th>
              <th style="padding:8px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ₹${order.totalPrice}</strong></p>
        <p style="color:#666;">Thank you for shopping with us!</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"ShopCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to ShopCart!',
    html: `<div style="font-family:sans-serif;padding:24px;"><h2>Hi ${name}! 👋</h2><p>Welcome to ShopCart. Start shopping!</p></div>`,
  });
};
