import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_USER, name: "e-Commerce App" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
};
export const sendVerificationResetPassword = async (
  email: string,
  token: string,
  id: string,
) => {
  const verificationLink = `${process.env.BASE_FRONT_URL}/reset-password/${id}/${token}`;
  await sendEmail(
    email,
    "Reset your password",
    `
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${verificationLink}">Reset Password</a>
  `,
  );
};
