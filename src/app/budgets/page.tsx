import { prisma } from "@/lib/db";
import { BudgetForm } from "@/components/budgets/budget-form";
import { BudgetCard } from "@/components/budgets/budget-card";

async function getBudgets() {
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

  return budgets.map((b) => {
    const spent = Math.round((spentByCategory[b.category] || 0) * 100) / 100;
    const rawPct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    return {
      ...b,
      spent,
      percentage: Math.min(Math.round(rawPct), 100),
    };
  });
}

export default async function BudgetsPage() {
  const budgets = await getBudgets();
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
          </p>
        </div>
        <BudgetForm existingCategories={budgets.map((b) => b.category)} />
      </div>

      {budgets.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          No budgets set. Create one to track your spending!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              id={b.id}
              category={b.category}
              limit={b.limit}
              spent={b.spent}
              percentage={b.percentage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
