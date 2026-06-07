"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export function IncomeVsExpenses({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Income vs Expenses (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No data available yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Income vs Expenses (Last 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
