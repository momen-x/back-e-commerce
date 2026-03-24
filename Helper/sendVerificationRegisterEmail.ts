import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationRegisterEmail = async (email: string, token: string) => {
  const inboxId = process.env.MAILTRAP_INBOX_ID; 
  const apiToken = process.env.MAILTRAP_TOKEN; 

  const data = {
    from: { email: "registration@example.com", name: "E-Commerce App" },
    to: [{ email: email }],
    subject: "Verify your email",
    html: `<h1>Welcome!</h1><p>Your token is: <b>${token}</b></p>`,
  };

  try {
    const url = `https://sandbox.api.mailtrap.io/api/send/${inboxId}`;

    const response = await axios.post(url, data, {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("تم الإرسال! افتح Mailtrap وشوف الـ Messages الآن.");
    return response.data;
  } catch (error: any) {
    console.error(" ERROR Mailtrap:", error.response?.data || error.message);
    throw error;
  }
};