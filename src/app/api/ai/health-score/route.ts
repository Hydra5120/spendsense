import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJsonModel } from "@/lib/gemini";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const budgets = await prisma.budget.findMany({
    where: { month: now.getMonth() + 1, year: now.getFullYear() },
  });

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const budgetAdherence = budgets.length > 0
    ? budgets.filter((b) => (categoryTotals[b.category] || 0) <= b.limit).length / budgets.length * 100
    : 50;

  if (transactions.length === 0) {
    return NextResponse.json({
      score: 50,
      summary: "Add some transactions to get your financial health score!",
    });
  }

  try {
    const result = await geminiJsonModel.generateContent(
      `You are a financial health analyzer for an Australian university student. Calculate a health score from 0-100.

Financial data:
- Monthly income: $${totalIncome.toFixed(2)}
- Monthly expenses: $${totalExpenses.toFixed(2)}
- Savings rate: ${savingsRate.toFixed(1)}%
- Budget adherence: ${budgetAdherence.toFixed(0)}% of budgets under limit
- Number of expense categories: ${Object.keys(categoryTotals).length}
- Top spending: ${Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join(", ")}

Scoring guide:
- 80-100: Excellent (good savings rate, under budget, diverse but controlled spending)
- 60-79: Good (some room for improvement)
- 40-59: Fair (overspending in some areas)
- 0-39: Needs attention (spending exceeds income or very poor budget adherence)

Return JSON: {"score": <number 0-100>, "summary": "<one sentence summary>"}`
    );

    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      summary: parsed.summary,
    });
  } catch {
    const heuristicScore = Math.min(100, Math.max(0, Math.round(
      (savingsRate > 0 ? 30 : 0) + (budgetAdherence * 0.4) + (totalIncome > 0 ? 20 : 0)
    )));

    return NextResponse.json({
      score: heuristicScore,
      summary: savingsRate > 20
        ? "You're saving well this month!"
        : "Try to reduce non-essential spending.",
    });
  }
}
