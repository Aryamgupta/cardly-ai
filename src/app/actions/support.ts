"use server";

import nodemailer from "nodemailer";
import { createClient } from "@/utils/supabase/server";

export async function submitSupportRequest(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "You must be logged in to send a support request." };
    }

    const message = formData.get("message") as string;
    
    if (!message || message.trim().length === 0) {
      return { error: "Please provide a message." };
    }

    // Configure your SMTP settings here using Environment Variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || '"Cardly Support" <support@cardly.ai>',
      to: process.env.SUPPORT_EMAIL || 'developer@cardly.ai', 
      subject: `New Support Request from ${user.email}`,
      text: `User Email: ${user.email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #6366f1; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">New Support Request</h2>
          </div>
          <div style="padding: 32px; background-color: #ffffff;">
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
              <strong style="color: #111827;">From:</strong> ${user.email}
            </p>
            <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                ${message.replace(/\n/g, "<br>")}
              </p>
            </div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
              This message was sent securely from the Cardly AI application.
            </p>
          </div>
        </div>
      `,
    };

    // Attempt to send email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Failed to send support email:", error);
    // Let the user know it failed gracefully
    return { error: "Failed to send the support request. Please try again later." };
  }
}
