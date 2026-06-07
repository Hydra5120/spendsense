import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      amount: parseFloat(body.amount),
      description: body.description,
      date: new Date(body.date),
      type: body.type,
      category: body.category,
      aiCategorized: body.aiCategorized ?? undefined,
      incomeSourceId: body.incomeSourceId ?? undefined,
    },
  });

  return NextResponse.json(transaction);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
