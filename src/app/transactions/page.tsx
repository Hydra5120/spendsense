import { prisma } from "@/lib/db";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { CsvImportDialog } from "@/components/transactions/csv-import-dialog";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    type?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const category = params.category || "";
  const type = params.type || "";
  const from = params.from || "";
  const to = params.to || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.description = { contains: search };
  }
  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.transaction.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <CsvImportDialog />
          <TransactionForm />
        </div>
      </div>

      <Suspense>
        <TransactionFilters />
      </Suspense>

      <TransactionList
        transactions={transactions.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        }))}
        total={total}
        page={page}
        totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
      />
    </div>
  );
}
