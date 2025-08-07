// import { Resend } from 'resend';
// import dotenv from 'dotenv';
// dotenv.config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const response = await resend.emails.send({
//       from: 'Tanvi <tanvi@resend.dev>', // Can be anything on @resend.dev unless you verify your domain
//       to,
//       subject,
//       html,
//     });
//     console.log('✅ Email sent:', response.id);
//     return { success: true };
//   } catch (error) {
//     console.error('❌ Email sending failed:', error);
//     return { success: false, message: error.message };
//   }
// };


import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: 'Tanvi <tanvi@resend.dev>', // must match verified sender
      to,
      subject,
      html,
    });

    // Full log of response
    console.log('✅ Email sent successfully!');
    console.log('📬 Resend Response:', response);

    return response;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

// export default sendEmail;
