"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency, getHecsTier } from "@/lib/utils";
import { HECS_REPAYMENT_THRESHOLD } from "@/lib/constants";
import { GraduationCap, Info, TrendingUp } from "lucide-react";

interface IncomeSource {
  amount: number;
  frequency: string;
}

interface HECSTrackerProps {
  sources: IncomeSource[];
}

const DEBT_KEY = "hecs_debt";
const RATE_KEY = "hecs_indexation_rate";

const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  one_off: 1,
};

export function HECSTracker({ sources }: HECSTrackerProps) {
  const [debtInput, setDebtInput] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [savedDebt, setSavedDebt] = useState<number | null>(null);
  const [savedRate, setSavedRate] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const debt = localStorage.getItem(DEBT_KEY);
    const rate = localStorage.getItem(RATE_KEY);
    if (debt) { setSavedDebt(parseFloat(debt)); setDebtInput(debt); }
    if (rate) { setSavedRate(parseFloat(rate)); setRateInput(rate); }
  }, []);

  function handleSave() {
    setSaving(true);
    const debt = parseFloat(debtInput);
    const rate = parseFloat(rateInput);
    if (!isNaN(debt) && debt >= 0) {
      localStorage.setItem(DEBT_KEY, String(debt));
      setSavedDebt(debt);
    }
    if (!isNaN(rate) && rate >= 0) {
      localStorage.setItem(RATE_KEY, String(rate));
      setSavedRate(rate);
    }
    setSaving(false);
  }

  const annualIncome = sources.reduce((sum, s) => {
    const multiplier = FREQUENCY_MULTIPLIERS[s.frequency] ?? 0;
    return sum + s.amount * multiplier;
  }, 0);

  const { rate, repayment } = getHecsTier(annualIncome);
  const aboveThreshold = annualIncome >= HECS_REPAYMENT_THRESHOLD;
  const debtAfterIndexation =
    savedDebt !== null && savedRate !== null
      ? savedDebt * (1 + savedRate / 100)
      : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            HECS Debt Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hecs-debt">Current HECS debt ($)</Label>
              <Input
                id="hecs-debt"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25000"
                value={debtInput}
                onChange={(e) => setDebtInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indexation-rate">Last indexation rate (%)</Label>
              <Input
                id="indexation-rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 4.7"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Check your MyGov account for the rate applied to your debt (2023-24 was 4.7%)
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || (!debtInput && !rateInput)}>
            Save
          </Button>
        </CardContent>
      </Card>

      {sources.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No income sources found</AlertTitle>
          <AlertDescription>
            Add income sources on the Income Sources tab to see your repayment tier.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <Alert variant={aboveThreshold ? "destructive" : "default"}>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>
              {aboveThreshold
                ? "Above repayment threshold"
                : "Below repayment threshold"}
            </AlertTitle>
            <AlertDescription>
              {aboveThreshold
                ? `Your estimated annual income of ${formatCurrency(annualIncome)} is above the $${HECS_REPAYMENT_THRESHOLD.toLocaleString()} threshold — compulsory repayments apply this year.`
                : `Your estimated annual income of ${formatCurrency(annualIncome)} is below the $${HECS_REPAYMENT_THRESHOLD.toLocaleString()} threshold — no compulsory repayments this year.`}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estimated Annual Repayment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatCurrency(repayment)}
                  </span>
                  <Badge variant="secondary">{(rate * 100).toFixed(1)}% rate</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {sources.length} income source{sources.length !== 1 ? "s" : ""} ({formatCurrency(annualIncome)}/yr)
                </p>
              </CardContent>
            </Card>

            {savedDebt !== null && debtAfterIndexation !== null && savedRate !== null && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Estimated Debt After Indexation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(debtAfterIndexation)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current {formatCurrency(savedDebt)} + {savedRate}% indexation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
