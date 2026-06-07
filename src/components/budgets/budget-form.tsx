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
import { CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/categories";
import { Plus, Loader2 } from "lucide-react";

interface BudgetFormProps {
  existingCategories: string[];
}

export function BudgetForm({ existingCategories }: BudgetFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (k) => !existingCategories.includes(k)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;

    setLoading(true);
    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, limit }),
      });
      setCategory("");
      setLimit("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Budget
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORIES[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Monthly Limit (AUD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
