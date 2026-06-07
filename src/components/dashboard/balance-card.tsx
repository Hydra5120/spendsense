"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export function BalanceCard({ balance, totalIncome, totalExpenses }: BalanceCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          <span className={balance >= 0 ? "text-emerald-600" : "text-red-600"}>
            {formatCurrency(balance)}
          </span>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
