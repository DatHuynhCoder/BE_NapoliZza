import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
})

const sendMail = async (to, subject, content) => {
  try {
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: to,
      subject: subject,
      html: content
    });
    console.log("📧 Email đã được gửi cho khách:", to);
    return true;
  } catch (error) {
    console.log("Error in sending mail", error);
    return false;
  }
}

export default sendMail;