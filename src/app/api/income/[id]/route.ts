import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const source = await prisma.incomeSource.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      amount: parseFloat(body.amount),
      frequency: body.frequency,
    },
  });

  return NextResponse.json(source);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.incomeSource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
