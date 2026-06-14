import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HECS_REPAYMENT_TIERS } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const audFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
})

export function formatCurrency(amount: number): string {
  return audFormatter.format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  })
}

export function getHecsTier(annualIncome: number): { rate: number; repayment: number } {
  const tier = HECS_REPAYMENT_TIERS.find(
    (t) => annualIncome >= t.min && annualIncome <= t.max
  ) ?? HECS_REPAYMENT_TIERS[0];
  return { rate: tier.rate, repayment: Math.round(annualIncome * tier.rate * 100) / 100 };
}
