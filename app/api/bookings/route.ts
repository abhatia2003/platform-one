import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUserBookEvent, LoyaltyTier, getTierDisplayName } from "@/lib/tierUtils";

type AnswerInput = {
  questionId: string;
  value: string;
};

type BookingRequest = {
  userId: string;
  eventId: string;
  roleAtBooking: "PARTICIPANT" | "VOLUNTEER";
  answers: AnswerInput[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Fetch all bookings for the user with event details
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        event: true,
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const { userId, eventId, roleAtBooking, answers } = body;

    // Validate required fields
    if (!userId || !eventId || !roleAtBooking) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this event
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already booked this event" },
        { status: 409 }
      );
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch user to check their tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check tier eligibility (only for participants, volunteers can book any event)
    if (roleAtBooking === "PARTICIPANT") {
      const userTier = user.tier as LoyaltyTier | null;
      const eventMinTier = event.minTier as LoyaltyTier;

      if (!canUserBookEvent(userTier, eventMinTier)) {
        const requiredTier = getTierDisplayName(eventMinTier);
        const currentTier = userTier ? getTierDisplayName(userTier) : "None";
        return NextResponse.json(
          {
            error: `This event requires ${requiredTier} tier or higher. Your current tier is ${currentTier}.`,
            code: "TIER_INSUFFICIENT",
          },
          { status: 403 }
        );
      }
    }

    // Create booking with answers in a transaction
    const booking = await prisma.booking.create({
      data: {
        userId,
        eventId,
        roleAtBooking,
        answers: {
          create: answers.map((answer) => ({
            questionId: answer.questionId,
            value: answer.value,
          })),
        },
      },
      include: {
        answers: true,
        event: true,
      },
    });

    return NextResponse.json(
      { message: "Booking created successfully", booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);

    // Handle unique constraint violation (P2002)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already booked this event" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");

    // Validate required fields
    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing userId or eventId parameter" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Delete answers first, then the booking
    await prisma.answer.deleteMany({
      where: {
        bookingId: booking.id,
      },
    });

    // Delete the booking
    await prisma.booking.delete({
      where: {
        id: booking.id,
      },
    });

    return NextResponse.json(
      { message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}