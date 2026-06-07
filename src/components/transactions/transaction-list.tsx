"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  category: string;
  aiCategorized: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export function TransactionList({
  transactions,
  total,
  page,
  totalPages,
}: TransactionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDelete = async (id: string) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`/transactions?${params.toString()}`);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No transactions found. Add your first one!
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(t.date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {t.description}
                  {t.aiCategorized && (
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <CategoryBadge category={t.category} />
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  t.type === "income" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} transactions</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-2">
            {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
