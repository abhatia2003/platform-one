import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role"); // e.g. "PARTICIPANT" or "VOLUNTEER"

    // Properly typed Prisma where clause
    const where: Prisma.UserWhereInput = {};

    // Only set role filter if it matches the Prisma enum
    if (
      roleParam &&
      Object.values(UserRole).includes(roleParam as UserRole)
    ) {
      where.role = roleParam as UserRole;
    } else if (roleParam) {
      // If you prefer to ignore invalid role instead of returning 400,
      // remove this block.
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Fetch users with their booking counts
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            eventId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include booking count
    const usersWithBookings = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier,
      createdAt: user.createdAt,
      bookingCount: user.bookings.length,
      bookings: user.bookings,
    }));

    return NextResponse.json(usersWithBookings);
  } catch (error) {
    console.error("Error fetching users attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch users attendance" },
      { status: 500 }
    );
  }
}