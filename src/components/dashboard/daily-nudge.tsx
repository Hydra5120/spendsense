"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

export function DailyNudge() {
  const [nudge, setNudge] = useState<{ title: string; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lastNudgeDate = localStorage.getItem("lastNudgeDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastNudgeDate === today) {
      const cached = localStorage.getItem("dailyNudge");
      if (cached) {
        setNudge(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    fetch("/api/ai/nudge", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setNudge(data);
        localStorage.setItem("dailyNudge", JSON.stringify(data));
        localStorage.setItem("lastNudgeDate", today);
      })
      .catch(() => {
        setNudge({
          title: "Daily Tip",
          message: "Track every expense, no matter how small!",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          Daily AI Nudge
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-12 animate-pulse rounded bg-muted" />
        ) : nudge ? (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {nudge.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
