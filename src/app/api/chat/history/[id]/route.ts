import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { flagged } = await request.json();

  const message = await prisma.chatMessage.update({
    where: { id },
    data: { flagged },
  });

  return NextResponse.json(message);
}
