"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/categories";
import { Search } from "lucide-react";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("search", search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParam]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(v) => updateParam("type", v ?? "all")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="expense">Expenses</SelectItem>
          <SelectItem value="income">Income</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v ?? "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {EXPENSE_CATEGORIES.map((key) => (
            <SelectItem key={key} value={key}>
              {CATEGORIES[key].label}
            </SelectItem>
          ))}
          <SelectItem value="income">Income</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[150px]"
        value={searchParams.get("from") || ""}
        onChange={(e) => updateParam("from", e.target.value)}
        placeholder="From"
      />
      <Input
        type="date"
        className="w-[150px]"
        value={searchParams.get("to") || ""}
        onChange={(e) => updateParam("to", e.target.value)}
        placeholder="To"
      />
    </div>
  );
}
