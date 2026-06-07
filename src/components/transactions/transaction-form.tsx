"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIES, EXPENSE_CATEGORIES, type CategoryKey } from "@/lib/categories";
import { Plus, Sparkles, Loader2 } from "lucide-react";

export function TransactionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>("");
  const [aiCategorized, setAiCategorized] = useState(false);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("expense");
    setCategory("");
    setAiCategorized(false);
  };

  const handleAutoCategorize = async () => {
    if (!description.trim()) return;
    setCategorizing(true);
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.category) {
        setCategory(data.category);
        setAiCategorized(true);
      }
    } catch {
      // Silently fail — user can still pick manually
    } finally {
      setCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    setLoading(true);
    try {
      const finalCategory = type === "income" ? "income" : category;
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          date,
          type,
          category: finalCategory,
          aiCategorized,
        }),
      });
      resetForm();
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const categories = type === "income"
    ? [{ key: "income" as const, label: "Income" }]
    : EXPENSE_CATEGORIES.map((k) => ({ key: k, label: CATEGORIES[k].label }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  if (!v) return;
                  setType(v as "income" | "expense");
                  if (v === "income") setCategory("income");
                  else setCategory("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AUD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Coffee at campus cafe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {type === "expense" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoCategorize}
                  disabled={categorizing || !description.trim()}
                  className="h-7 text-xs"
                >
                  {categorizing ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Auto-categorize
                </Button>
              </div>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
