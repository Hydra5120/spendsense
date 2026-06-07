import { prisma } from "@/lib/db";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalCard } from "@/components/goals/goal-card";

export default async function GoalsPage() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { deadline: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <GoalForm />
      </div>

      {goals.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          No savings goals yet. Create one to start saving!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              name={goal.name}
              targetAmount={goal.targetAmount}
              currentAmount={goal.currentAmount}
              deadline={goal.deadline.toISOString()}
              weeklyTarget={goal.weeklyTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
}
