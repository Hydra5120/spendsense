import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.targetAmount !== undefined) data.targetAmount = parseFloat(body.targetAmount);
  if (body.currentAmount !== undefined) data.currentAmount = parseFloat(body.currentAmount);
  if (body.deadline !== undefined) data.deadline = new Date(body.deadline);
  if (body.addAmount !== undefined) {
    const goal = await prisma.savingsGoal.findUnique({ where: { id } });
    if (goal) {
      data.currentAmount = goal.currentAmount + parseFloat(body.addAmount);
    }
  }

  const goal = await prisma.savingsGoal.update({ where: { id }, data });
  return NextResponse.json(goal);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
