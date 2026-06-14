"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, Pencil } from "lucide-react";

interface ForthnightSummary {
  configured: boolean;
  fortnightStart: string;
  nextPaymentDate: string;
  daysUntilPayment: number;
  fortnightProgress: number;
  totalIncome: number;
  totalExpenses: number;
  netRemaining: number;
}

const STORAGE_KEY = "centrelink_start_date";

export function CentrelinkTracker() {
  const [startDate, setStartDate] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [summary, setSummary] = useState<ForthnightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setStartDate(saved);
      setInputDate(saved);
      fetchSummary(saved);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchSummary(date: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/student-settings/fortnightly-summary?startDate=${date}`);
      const data = await res.json();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!inputDate) return;
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, inputDate);
    setStartDate(inputDate);
    setEditing(false);
    await fetchSummary(inputDate);
    setSaving(false);
  }

  const dayOfFortnight = summary
    ? Math.round((summary.fortnightProgress / 100) * 14)
    : 0;

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (!startDate || editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4" />
            Set Up Centrelink Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the date of your most recent Centrelink payment to track your fortnightly cycle.
          </p>
          <div className="space-y-2">
            <Label htmlFor="start-date">Most recent payment date</Label>
            <Input
              id="start-date"
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!inputDate || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {editing && (
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary?.configured) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Could not calculate fortnightly window. Try updating your payment date.
          </p>
          <Button variant="outline" className="mt-3" onClick={() => setEditing(true)}>
            Update Date
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Next Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{summary.daysUntilPayment}</span>
              <span className="text-sm text-muted-foreground">days away</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(summary.nextPaymentDate)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-1 h-3 w-3" />
              Change date
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fortnight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground mb-1">
              <span>Day {dayOfFortnight} of 14</span>
              <span>{summary.fortnightProgress}%</span>
            </div>
            <Progress value={summary.fortnightProgress} />
            <p className="mt-2 text-xs text-muted-foreground">
              Period: {formatDate(summary.fortnightStart)} — {formatDate(summary.nextPaymentDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income This Fortnight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses This Fortnight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.netRemaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {formatCurrency(summary.netRemaining)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
