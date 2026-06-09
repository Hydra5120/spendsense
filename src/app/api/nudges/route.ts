import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateNudges } from "@/lib/nudge-engine";

export async function GET() {
  const nudges = await prisma.nudge.findMany({
    where: { dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(nudges);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nudges = await generateNudges(body.transactionId);
  return NextResponse.json(nudges);
}
