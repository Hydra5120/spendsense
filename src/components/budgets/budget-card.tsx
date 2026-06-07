"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BudgetCardProps {
  id: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
}

export function BudgetCard({ id, category, limit, spent, percentage }: BudgetCardProps) {
  const router = useRouter();
  const cat = CATEGORIES[category as CategoryKey];
  const label = cat?.label ?? category;
  const color = cat?.color ?? "#94a3b8";

  const rawPercentage = Math.round((spent / limit) * 100);
  const barColor =
    rawPercentage > 85 ? "bg-red-500" : rawPercentage > 60 ? "bg-amber-500" : "bg-emerald-500";

  const handleDelete = async () => {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${barColor} transition-all`}
            style={{ width: `${Math.min(rawPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {formatCurrency(spent)} of {formatCurrency(limit)}
          </span>
          <span className={rawPercentage > 85 ? "text-red-500 font-medium" : ""}>
            {rawPercentage}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
