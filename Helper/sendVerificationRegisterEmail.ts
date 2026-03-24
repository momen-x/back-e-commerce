import nodemailer from "nodemailer"; 
import SMTPTransport from "nodemailer/lib/smtp-transport";
 import dotenv from "dotenv";
  dotenv.config();
   export const sendVerificationRegisterEmail = async ( email: string, token: string) =>
     { const transportOptions = { host: "smtp.gmail.com", port: 587, secure: false, family: 4, auth:
       { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, }, } as SMTPTransport.Options; 
       const verificationLink = `${process.env.BASE_FRONT_URL}//verify-email/${token}`;
        const transporter = nodemailer.createTransport(transportOptions);
         await transporter.sendMail({ from: `"e-Commerce App" <${process.env.EMAIL_USER}>`,
           to: email, 
           subject: "Verify your email", 
           html: `
            <h2>Email Verification</h2>
            <p>Please click the link below to verify your email:</p>
            <a href="${verificationLink}">Verify Email</a>
           `, 
            });
           };