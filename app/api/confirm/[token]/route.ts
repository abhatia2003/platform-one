import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the confirmation record
    const confirmation = await prisma.reminderConfirmation.findUnique({
      where: { token },
      include: {
        booking: {
          include: {
            event: true,
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

    if (!confirmation) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: confirmation.id,
      token: confirmation.token,
      status: confirmation.status,
      sentAt: confirmation.sentAt,
      respondedAt: confirmation.respondedAt,
      event: {
        id: confirmation.booking.event.id,
        name: confirmation.booking.event.name,
        start: confirmation.booking.event.start,
        end: confirmation.booking.event.end,
        location: confirmation.booking.event.location,
      },
      user: {
        name: confirmation.booking.user.name,
        email: confirmation.booking.user.email,
      },
    });
  } catch (error: any) {
    console.error("Error fetching confirmation:", error);
    return NextResponse.json(
      { error: "Failed to fetch confirmation details" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["confirm", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'confirm' or 'decline'" },
        { status: 400 }
      );
    }

    // Find the confirmation record
    const confirmation = await prisma.reminderConfirmation.findUnique({
      where: { token },
      include: {
        booking: {
          include: {
            event: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!confirmation) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 404 }
      );
    }

    // Update the confirmation status
    const newStatus = action === "confirm" ? "CONFIRMED" : "DECLINED";
    
    const updatedConfirmation = await prisma.reminderConfirmation.update({
      where: { token },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: action === "confirm" 
        ? "Your attendance has been confirmed!" 
        : "Your response has been recorded.",
      status: updatedConfirmation.status,
      eventName: confirmation.booking.event.name,
    });
  } catch (error: any) {
    console.error("Error updating confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update confirmation" },
      { status: 500 }
    );
  }
}
