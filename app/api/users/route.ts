import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";

function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const roleParam = searchParams.get("role"); // e.g. "PARTICIPANT" | "VOLUNTEER"
    const takeRaw = searchParams.get("take");
    const take = Math.min(Math.max(parseInt(takeRaw ?? "10", 10) || 10, 1), 100);

    const where: Prisma.UserWhereInput = {};

    if (roleParam) {
      // If you want case-insensitive query params like ?role=volunteer:
      const normalized = roleParam.toUpperCase();
      if (!isUserRole(normalized)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      where.role = normalized;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // ⚠️ Don't return password hashes to clients
        // password: true,
        tier: true,
      },
      take,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, password } = body as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    // Validate input
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, role, password" },
        { status: 400 }
      );
    }

    const normalizedRole = role.toUpperCase();
    if (!isUserRole(normalizedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // NOTE: you should hash this before storing (e.g. bcrypt)
        role: normalizedRole, // ✅ correct enum type
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        // never return password
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}