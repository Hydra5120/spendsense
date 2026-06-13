import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50");
  const before = searchParams.get("before");
  const sessionId = request.headers.get("x-session-id") ?? "";

  const where = {
    sessionId,
    ...(before ? { createdAt: { lt: new Date(before) } } : {}),
  };

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(messages.reverse());
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.headers.get("x-session-id") ?? "";
  await prisma.chatMessage.deleteMany({ where: { sessionId } });
  return NextResponse.json({ success: true });
}
