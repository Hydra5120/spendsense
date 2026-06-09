"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  X,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Nudge {
  id: string;
  type: string;
  title: string;
  message: string;
}

const iconMap: Record<string, typeof TrendingUp> = {
  income_detected: DollarSign,
  high_spending: AlertTriangle,
  low_balance: AlertTriangle,
  daily_tip: Lightbulb,
};

const colorMap: Record<string, string> = {
  income_detected: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
  high_spending: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  low_balance: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  daily_tip: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
};

export function NudgeAlerts({ nudges }: { nudges: Nudge[] }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (nudges.length === 0) return null;

  const visibleNudges = nudges.filter((n) => !dismissed.has(n.id));
  if (visibleNudges.length === 0) return null;

  const handleDismiss = async (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    await fetch(`/api/nudges/${id}`, { method: "PATCH" });
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {visibleNudges.map((nudge) => {
        const Icon = iconMap[nudge.type] || Lightbulb;
        return (
          <Alert
            key={nudge.id}
            className={`relative ${colorMap[nudge.type] || ""}`}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="pr-8 text-sm">{nudge.title}</AlertTitle>
            <AlertDescription className="text-xs">
              {nudge.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={() => handleDismiss(nudge.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        );
      })}
    </div>
  );
}
