"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, Plus, RefreshCw, Loader2, Target, Sparkles } from "lucide-react";

interface GoalCardProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  weeklyTarget: number | null;
}

export function GoalCard({
  id,
  name,
  targetAmount,
  currentAmount,
  deadline,
  weeklyTarget,
}: GoalCardProps) {
  const router = useRouter();
  const [addAmount, setAddAmount] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const percentage = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100
  );
  const remaining = targetAmount - currentAmount;
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const handleAdd = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    setLoading(true);
    try {
      await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addAmount }),
      });
      setAddAmount("");
      setShowAdd(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await fetch("/api/ai/savings-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: id }),
      });
      router.refresh();
    } finally {
      setRecalculating(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-emerald-600" />
            {name}
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
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>
              {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
            </span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(remaining)} remaining</span>
          <span>{daysLeft} days left</span>
        </div>

        {weeklyTarget && (
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">
            <Sparkles className="h-3 w-3" />
            Save {formatCurrency(weeklyTarget)}/week to reach your goal
          </div>
        )}

        <div className="flex gap-2">
          {showAdd ? (
            <div className="flex flex-1 gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Savings
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
