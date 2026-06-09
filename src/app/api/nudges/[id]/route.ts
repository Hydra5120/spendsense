import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const nudge = await prisma.nudge.update({
    where: { id },
    data: { dismissed: true },
  });

  return NextResponse.json(nudge);
}
