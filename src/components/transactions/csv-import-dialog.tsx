"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import Papa from "papaparse";

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

export function CsvImportDialog() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed: ParsedRow[] = results.data.map((row: any) => {
            const amount = parseFloat(row.amount || row.Amount || "0");
            const type =
              row.type || row.Type || (amount >= 0 ? "income" : "expense");
            return {
              date: row.date || row.Date || new Date().toISOString().split("T")[0],
              description: row.description || row.Description || "",
              amount: Math.abs(amount),
              type: type === "income" ? "income" : "expense",
            };
          });
          setRows(parsed.filter((r) => r.description && r.amount > 0));
        } catch {
          setError("Failed to parse CSV. Ensure columns: date, description, amount");
        }
      },
      error: () => {
        setError("Failed to read file.");
      },
    });
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: rows }),
      });
      if (!res.ok) throw new Error();
      setRows([]);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRows([]); setError(""); } }}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV with columns: <strong>date</strong>,{" "}
            <strong>description</strong>, <strong>amount</strong>. Categories
            will be auto-assigned by AI.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground file:text-sm"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {rows.length > 0 && (
            <>
              <div className="max-h-60 overflow-y-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 50).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell className="text-xs">{r.description}</TableCell>
                        <TableCell className="text-xs">${r.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs capitalize">{r.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                {rows.length} transactions to import
                {rows.length > 50 ? " (showing first 50)" : ""}
              </p>
              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing & categorizing...
                  </>
                ) : (
                  `Import ${rows.length} Transactions`
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
