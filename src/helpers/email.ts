import nodemailer from "nodemailer";

// Func main to send Email
export const sendEmail = async (email: string, subject: string, content: string, isHtml: boolean) => {
  // Create a transporter object using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Set up email data
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    cc: process.env.SMTP_CC,
    subject: subject,
    [isHtml ? "html" : "text"]: content,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}