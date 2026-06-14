import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MS_PER_FORTNIGHT = 14 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const startDateParam = request.nextUrl.searchParams.get("startDate");
  if (!startDateParam) {
    return NextResponse.json({ configured: false });
  }

  const startDate = new Date(startDateParam);
  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();

  if (elapsed < 0) {
    return NextResponse.json({ configured: false });
  }

  const cycleNumber = Math.floor(elapsed / MS_PER_FORTNIGHT);
  const fortnightStart = new Date(startDate.getTime() + cycleNumber * MS_PER_FORTNIGHT);
  const nextPaymentDate = new Date(fortnightStart.getTime() + MS_PER_FORTNIGHT);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: fortnightStart, lt: nextPaymentDate } },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const cycleElapsed = elapsed % MS_PER_FORTNIGHT;
  const fortnightProgress = Math.round((cycleElapsed / MS_PER_FORTNIGHT) * 100);
  const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - now.getTime()) / 86400000);

  return NextResponse.json({
    configured: true,
    fortnightStart: fortnightStart.toISOString(),
    nextPaymentDate: nextPaymentDate.toISOString(),
    daysUntilPayment,
    fortnightProgress,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netRemaining: Math.round((totalIncome - totalExpenses) * 100) / 100,
  });
}
