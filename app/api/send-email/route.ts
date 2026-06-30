import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, text, api_secret } = body;

    const EXPECTED_SECRET = process.env.EMAIL_API_SECRET || "default_insecure_secret_change_me_in_prod";

    if (api_secret !== EXPECTED_SECRET) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    if (!to || !subject || !text) {
      return NextResponse.json(
        { detail: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"StudySphere Support" <${process.env.EMAIL_HOST_USER}>`,
      to,
      subject,
      text,
    });

    return NextResponse.json({ detail: "Email sent successfully", info }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { detail: `Email delivery failed: ${error.message}` },
      { status: 500 }
    );
  }
}
