import { prisma } from "@/lib/db";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SpendingDonut } from "@/components/dashboard/spending-donut";
import { SpendingTrend } from "@/components/dashboard/spending-trend";
import { HealthScore } from "@/components/dashboard/health-score";
import { DailyNudge } from "@/components/dashboard/daily-nudge";
import { NudgeAlerts } from "@/components/dashboard/nudge-alerts";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: "asc" },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const dailyTotals: Record<string, number> = {};
  recentTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const day = new Date(t.date).toISOString().split("T")[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
    });

  const trendData = Object.entries(dailyTotals)
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const nudges = await prisma.nudge.findMany({
    where: { dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    balance,
    totalIncome,
    totalExpenses,
    categoryTotals,
    trendData,
    nudges,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          balance={data.balance}
          totalIncome={data.totalIncome}
          totalExpenses={data.totalExpenses}
        />
        <HealthScore />
        <DailyNudge />
      </div>

      <NudgeAlerts nudges={data.nudges} />

      <div className="grid gap-4 md:grid-cols-2">
        <SpendingDonut categoryTotals={data.categoryTotals} />
        <SpendingTrend trendData={data.trendData} />
      </div>
    </div>
  );
}
