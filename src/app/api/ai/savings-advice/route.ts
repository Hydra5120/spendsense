import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJsonModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const { goalId } = await request.json();

  const goal = await prisma.savingsGoal.findUnique({ where: { id: goalId } });
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: threeMonthsAgo } },
  });

  const months = 3;
  const avgMonthlyIncome =
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0) / months;
  const avgMonthlyExpenses =
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0) / months;

  const remaining = goal.targetAmount - goal.currentAmount;
  const weeksLeft = Math.max(
    1,
    Math.ceil(
      (new Date(goal.deadline).getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  );

  const simpleWeeklyTarget = Math.ceil((remaining / weeksLeft) * 100) / 100;

  try {
    const result = await geminiJsonModel.generateContent(
      `You are a financial advisor for an Australian university student.

Savings goal: "${goal.name}"
- Target: $${goal.targetAmount.toFixed(2)}
- Current: $${goal.currentAmount.toFixed(2)}
- Remaining: $${remaining.toFixed(2)}
- Deadline: ${new Date(goal.deadline).toLocaleDateString("en-AU")}
- Weeks remaining: ${weeksLeft}

Student's average monthly:
- Income: $${avgMonthlyIncome.toFixed(2)}
- Expenses: $${avgMonthlyExpenses.toFixed(2)}
- Available: $${(avgMonthlyIncome - avgMonthlyExpenses).toFixed(2)}

Simple calculation: $${simpleWeeklyTarget.toFixed(2)}/week

Provide a realistic weekly savings target and brief advice.

Return JSON: {"weeklyTarget": <number>, "advice": "<1-2 sentence advice>"}`
    );

    const text = result.response.text();
    const parsed = JSON.parse(text);

    const weeklyTarget = Math.round(parsed.weeklyTarget * 100) / 100;

    await prisma.savingsGoal.update({
      where: { id: goalId },
      data: { weeklyTarget },
    });

    return NextResponse.json({
      weeklyTarget,
      advice: parsed.advice || "Stay consistent with your weekly savings!",
    });
  } catch {
    await prisma.savingsGoal.update({
      where: { id: goalId },
      data: { weeklyTarget: simpleWeeklyTarget },
    });

    return NextResponse.json({
      weeklyTarget: simpleWeeklyTarget,
      advice: `Save $${simpleWeeklyTarget.toFixed(2)} per week to reach your goal on time.`,
    });
  }
}
