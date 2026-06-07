"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { INCOME_SOURCE_TYPES, FREQUENCY_OPTIONS } from "@/lib/constants";
import { Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

interface IncomeSource {
  id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
}

export function IncomeList({ sources }: { sources: IncomeSource[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await fetch(`/api/income/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const getMonthlyEstimate = (amount: number, frequency: string) => {
    switch (frequency) {
      case "weekly": return amount * 4.33;
      case "fortnightly": return amount * 2.17;
      case "monthly": return amount;
      case "one_off": return amount;
      default: return amount;
    }
  };

  const totalMonthly = sources.reduce(
    (sum, s) => sum + getMonthlyEstimate(s.amount, s.frequency),
    0
  );

  if (sources.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No income sources added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        Estimated monthly income: <strong className="text-foreground">{formatCurrency(totalMonthly)}</strong>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {source.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(source.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(source.amount)}
              </div>
              <div className="mt-1 flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {INCOME_SOURCE_TYPES[source.type as keyof typeof INCOME_SOURCE_TYPES] || source.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {FREQUENCY_OPTIONS[source.frequency as keyof typeof FREQUENCY_OPTIONS] || source.frequency}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
