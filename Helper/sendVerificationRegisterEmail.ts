import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY as string,
});

export const sendVerificationRegisterEmail = async (
  email: string,
  token: string,
) => {
  const verificationLink = `${process.env.BASE_FRONT_URL}/verify-email/${token}`;

  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL as string,
      name: "e-Commerce App",
    },
    to: [{ email }],
    subject: "Verify your email",
    htmlContent: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  });
};
