import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJsonModel } from "@/lib/gemini";

export async function POST() {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: sevenDaysAgo } },
    orderBy: { date: "desc" },
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const allMonthTransactions = await prisma.transaction.findMany({
    where: { date: { gte: startOfMonth } },
  });

  const totalIncome = allMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const goals = await prisma.savingsGoal.findMany();

  const recentSummary = recentTransactions
    .slice(0, 10)
    .map((t) => `${t.type}: $${t.amount.toFixed(2)} - ${t.description} (${t.category})`)
    .join("\n");

  try {
    const result = await geminiJsonModel.generateContent(
      `You are SpendSense, a friendly financial assistant for an Australian university student.

Recent activity (last 7 days):
${recentSummary || "No recent transactions"}

This month: Income $${totalIncome.toFixed(2)}, Expenses $${totalExpenses.toFixed(2)}, Balance: $${balance.toFixed(2)}
Savings goals: ${goals.map((g) => `${g.name}: $${g.currentAmount}/$${g.targetAmount}`).join(", ") || "None set"}

Generate one short, actionable daily financial tip. Be encouraging. Reference Australian student context (Centrelink, HECS, campus life) when relevant.

Return JSON: {"title": "<3-5 word title>", "message": "<1-2 sentence tip>"}`
    );

    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      title: parsed.title || "Daily Tip",
      message: parsed.message || "Keep tracking your spending!",
    });
  } catch {
    return NextResponse.json({
      title: "Daily Tip",
      message: "Track every expense today — small purchases add up fast!",
    });
  }
}
