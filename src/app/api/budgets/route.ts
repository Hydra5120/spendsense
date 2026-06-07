import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { month, year },
    orderBy: { category: "asc" },
  });

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.transaction.findMany({
    where: {
      type: "expense",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const spentByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  const budgetsWithSpent = budgets.map((b) => ({
    ...b,
    spent: Math.round((spentByCategory[b.category] || 0) * 100) / 100,
    percentage: Math.min(
      Math.round(((spentByCategory[b.category] || 0) / b.limit) * 100),
      100
    ),
  }));

  return NextResponse.json(budgetsWithSpent);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date();

  const budget = await prisma.budget.create({
    data: {
      category: body.category,
      limit: parseFloat(body.limit),
      month: body.month || now.getMonth() + 1,
      year: body.year || now.getFullYear(),
    },
  });

  return NextResponse.json(budget, { status: 201 });
}
