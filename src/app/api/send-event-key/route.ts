import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { eventTitle, secretKey, organizerEmail, adminEmails } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send to all admin emails
  const validAdmins = (adminEmails as string[]).filter(e => e.trim() !== '');
  
  for (const adminEmail of validAdmins) {
    await transporter.sendMail({
      from: `"BrainBell Events" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔑 Event Approval Key: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <h2 style="color: #1a1a2e;">New Event Pending Approval</h2>
          <p>An organizer has submitted a new event on <strong>BrainBell</strong>.</p>
          <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Submitted by:</strong> ${organizerEmail || 'Not provided'}</p>
            <p style="font-size: 26px; letter-spacing: 6px; color: #0d9488; font-weight: bold; text-align: center; padding: 12px; background: #f0fdfa; border-radius: 8px;">
              ${secretKey}
            </p>
          </div>
          <p style="color: #666; font-size: 13px;">Go to BrainBell → Event Zone → switch to Admin → find the pending event → enter this key to approve or reject.</p>
        </div>
      `,
    });
  }

  // Confirmation to organizer
  if (organizerEmail) {
    await transporter.sendMail({
      from: `"BrainBell Events" <${process.env.EMAIL_USER}>`,
      to: organizerEmail,
      subject: `✅ Event Submitted: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <h2 style="color: #1a1a2e;">Event Submitted!</h2>
          <p>Your event <strong>${eventTitle}</strong> has been submitted for approval.</p>
          <p>Key sent to <strong>${validAdmins.length}</strong> admin(s). You'll see it live once approved.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}