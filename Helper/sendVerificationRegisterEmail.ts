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

export const sendVerificationRegisterEmail = async (
  email: string,
  token: string,
) => {
  const verificationLink = `${process.env.BASE_FRONT_URL}/verify-email/${token}`;
  await sendEmail(
    email,
    "Verify your email",
    `
    <h2>Email Verification</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `,
  );
};


