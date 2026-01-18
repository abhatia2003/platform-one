import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomUUID } from "crypto";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

type SendReminderRequest = {
  eventId: string;
  subject: string;
  message: string;
  recipientType: "all" | "participants" | "volunteers";
  includeConfirmationLink?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body: SendReminderRequest = await request.json();
    const { eventId, subject, message, recipientType, includeConfirmationLink = false } = body;

    // Validate required fields
    if (!eventId || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, subject, and message are required" },
        { status: 400 }
      );
    }

    // Fetch event with bookings and user details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Filter recipients based on type
    let recipients = event.bookings;
    if (recipientType === "participants") {
      recipients = recipients.filter((b) => b.roleAtBooking === "PARTICIPANT");
    } else if (recipientType === "volunteers") {
      recipients = recipients.filter((b) => b.roleAtBooking === "VOLUNTEER");
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for the selected criteria" },
        { status: 400 }
      );
    }

    // Get unique bookings (in case of duplicates)
    const emailSet = new Set<string>();
    const uniqueRecipients = recipients.filter((r) => {
      if (emailSet.has(r.user.email)) return false;
      emailSet.add(r.user.email);
      return true;
    });

    // Format the event date for the email
    const eventDate = new Date(event.start).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get the base URL for confirmation links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    // Create confirmation tokens if needed
    const recipientData: Array<{
      email: string;
      name: string;
      bookingId: string;
      confirmationToken?: string;
    }> = [];

    for (const recipient of uniqueRecipients) {
      let confirmationToken: string | undefined;

      if (includeConfirmationLink) {
        // Create a confirmation token for this recipient
        const token = randomUUID();
        await prisma.reminderConfirmation.create({
          data: {
            token,
            bookingId: recipient.id,
            status: "PENDING",
          },
        });
        confirmationToken = token;
      }

      recipientData.push({
        email: recipient.user.email,
        name: recipient.user.name,
        bookingId: recipient.id,
        confirmationToken,
      });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // Return mock success for development without API key
      console.log("RESEND_API_KEY not configured. Mock sending emails to:", recipientData);
      return NextResponse.json({
        success: true,
        message: `Email would be sent to ${recipientData.length} recipient(s) (API key not configured)`,
        recipients: recipientData.map((r) => r.email),
        confirmationTokensCreated: includeConfirmationLink ? recipientData.length : 0,
        mock: true,
      });
    }

    // Send emails using Resend
    const emailPromises = recipientData.map((recipient) => {
      // Build confirmation buttons HTML if needed
      const confirmationButtonsHtml = includeConfirmationLink && recipient.confirmationToken
        ? `
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #374151; margin-bottom: 15px; font-weight: bold;">Please confirm your attendance:</p>
            <a href="${baseUrl}/confirm/${recipient.confirmationToken}" 
               style="display: inline-block; background-color: #1e293b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              Confirm Attendance
            </a>
          </div>
        `
        : "";

      return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Platform One <noreply@resend.dev>",
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Platform One</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Hello ${recipient.name},</p>
              <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1e293b; margin-top: 0;">${event.name}</h2>
                <p style="color: #6b7280; margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
                <p style="color: #6b7280; margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
              </div>
              <div style="white-space: pre-wrap; color: #374151; line-height: 1.6;">
${message}
              </div>
              ${confirmationButtonsHtml}
            </div>
            <div style="background-color: #e5e7eb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">© 2026 Platform One. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully`,
      stats: {
        total: recipientData.length,
        successful,
        failed,
      },
      recipients: recipientData.map((r) => r.email),
      confirmationTokensCreated: includeConfirmationLink ? recipientData.length : 0,
    });
  } catch (error: any) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send reminders" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch attendees for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId parameter" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            confirmations: {
              orderBy: {
                sentAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const participants = event.bookings
      .filter((b) => b.roleAtBooking === "PARTICIPANT")
      .map((b) => ({
        id: b.user.id,
        bookingId: b.id,
        name: b.user.name,
        email: b.user.email,
        role: "PARTICIPANT",
        confirmationStatus: b.confirmations[0]?.status || null,
        lastReminderSent: b.confirmations[0]?.sentAt || null,
      }));

    const volunteers = event.bookings
      .filter((b) => b.roleAtBooking === "VOLUNTEER")
      .map((b) => ({
        id: b.user.id,
        bookingId: b.id,
        name: b.user.name,
        email: b.user.email,
        role: "VOLUNTEER",
        confirmationStatus: b.confirmations[0]?.status || null,
        lastReminderSent: b.confirmations[0]?.sentAt || null,
      }));

    // Calculate confirmation stats
    const allAttendees = [...participants, ...volunteers];
    const confirmed = allAttendees.filter((a) => a.confirmationStatus === "CONFIRMED").length;
    const declined = allAttendees.filter((a) => a.confirmationStatus === "DECLINED").length;
    const pending = allAttendees.filter((a) => a.confirmationStatus === "PENDING").length;
    const notSent = allAttendees.filter((a) => a.confirmationStatus === null).length;

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        start: event.start,
        end: event.end,
        location: event.location,
      },
      participants,
      volunteers,
      totalAttendees: participants.length + volunteers.length,
      confirmationStats: {
        confirmed,
        declined,
        pending,
        notSent,
      },
    });
  } catch (error: any) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
