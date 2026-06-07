import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const budget = await prisma.budget.update({
    where: { id },
    data: {
      limit: parseFloat(body.limit),
      category: body.category,
    },
  });

  return NextResponse.json(budget);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
