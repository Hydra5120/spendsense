import { prisma } from "@/lib/db";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeList } from "@/components/income/income-list";
import { IncomeVsExpenses } from "@/components/income/income-vs-expenses";

async function getIncomeData() {
  const sources = await prisma.incomeSource.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: sixMonthsAgo } },
  });

  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
    monthlyData[key] = { income: 0, expenses: 0 };
  }

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
    if (monthlyData[key]) {
      if (t.type === "income") {
        monthlyData[key].income += t.amount;
      } else {
        monthlyData[key].expenses += t.amount;
      }
    }
  });

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: Math.round(data.income * 100) / 100,
    expenses: Math.round(data.expenses * 100) / 100,
  }));

  return { sources, chartData };
}

export default async function IncomePage() {
  const { sources, chartData } = await getIncomeData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Income Tracker</h1>
        <IncomeForm />
      </div>

      <IncomeList sources={sources} />

      <IncomeVsExpenses data={chartData} />
    </div>
  );
}
