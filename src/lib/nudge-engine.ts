import { prisma } from "@/lib/db";
import { geminiJsonModel } from "@/lib/gemini";

export async function generateNudges(transactionId?: string) {
  const nudges: { type: string; title: string; message: string }[] = [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (transactionId) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (tx && tx.type === "income" && tx.amount >= 100) {
      nudges.push(await generateIncomeNudge(tx.amount));
    }
  }

  const monthTransactions = await prisma.transaction.findMany({
    where: { date: { gte: startOfMonth } },
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  if (balance < 200 && totalExpenses > 0) {
    nudges.push({
      type: "low_balance",
      title: "Low Balance Alert",
      message: `Your balance this month is $${balance.toFixed(2)}. Consider reducing non-essential spending.`,
    });
  }

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const prevTransactions = await prisma.transaction.findMany({
    where: { type: "expense", date: { gte: prevMonthStart, lte: prevMonthEnd } },
  });

  const currentCategoryTotals: Record<string, number> = {};
  const prevCategoryTotals: Record<string, number> = {};

  monthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      currentCategoryTotals[t.category] =
        (currentCategoryTotals[t.category] || 0) + t.amount;
    });

  prevTransactions.forEach((t) => {
    prevCategoryTotals[t.category] =
      (prevCategoryTotals[t.category] || 0) + t.amount;
  });

  for (const [category, current] of Object.entries(currentCategoryTotals)) {
    const previous = prevCategoryTotals[category] || 0;
    if (previous > 0 && current > previous * 1.3) {
      const pctIncrease = Math.round(((current - previous) / previous) * 100);
      nudges.push({
        type: "high_spending",
        title: `${category} Spending Up`,
        message: `Your ${category} spending is ${pctIncrease}% higher than last month ($${current.toFixed(2)} vs $${previous.toFixed(2)}).`,
      });
    }
  }

  for (const nudge of nudges) {
    const existing = await prisma.nudge.findFirst({
      where: {
        type: nudge.type,
        dismissed: false,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      await prisma.nudge.create({ data: nudge });
    }
  }

  return nudges;
}

async function generateIncomeNudge(amount: number): Promise<{
  type: string;
  title: string;
  message: string;
}> {
  try {
    const result = await geminiJsonModel.generateContent(
      `A university student just received $${amount.toFixed(2)} in income. Generate a short, encouraging nudge suggesting they save a portion.

Return JSON: {"title": "<3-5 words>", "message": "<1 sentence, encouraging, specific to the amount>"}`
    );

    const parsed = JSON.parse(result.response.text());
    return {
      type: "income_detected",
      title: parsed.title || "Income Received!",
      message: parsed.message || `You received $${amount.toFixed(2)}. Consider saving 20%!`,
    };
  } catch {
    return {
      type: "income_detected",
      title: "Income Received!",
      message: `You received $${amount.toFixed(2)}. Consider putting ${Math.round(amount * 0.2)} into savings!`,
    };
  }
}
