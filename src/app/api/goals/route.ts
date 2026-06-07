import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const goal = await prisma.savingsGoal.create({
    data: {
      name: body.name,
      targetAmount: parseFloat(body.targetAmount),
      currentAmount: parseFloat(body.currentAmount || "0"),
      deadline: new Date(body.deadline),
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
