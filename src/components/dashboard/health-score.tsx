"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export function HealthScore() {
  const [score, setScore] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/health-score")
      .then((res) => res.json())
      .then((data) => {
        setScore(data.score);
        setSummary(data.summary);
      })
      .catch(() => {
        setScore(65);
        setSummary("Unable to calculate score right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getColor = (s: number) => {
    if (s >= 71) return "text-emerald-600";
    if (s >= 41) return "text-amber-500";
    return "text-red-500";
  };

  const getBgColor = (s: number) => {
    if (s >= 71) return "bg-emerald-100";
    if (s >= 41) return "bg-amber-100";
    return "bg-red-100";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-16 animate-pulse rounded bg-muted" />
        ) : score !== null ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${getColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {summary}
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
