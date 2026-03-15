import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY as string,
});

export const sendVerificationResetPassword = async (
  email: string,
  token: string,
  id: string
) => {
  const verificationLink = `${process.env.BASE_FRONT_URL}/password/verify-email/${id}/${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL as string,
      name: "e-Commerce App",
    },
    to: [{ email }],
    subject: "Verify your email",
    htmlContent: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  });
};