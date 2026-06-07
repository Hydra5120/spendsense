export const CATEGORIES = {
  food: { label: "Food & Groceries", color: "#22c55e", icon: "ShoppingCart" },
  dining_out: { label: "Dining Out", color: "#f97316", icon: "UtensilsCrossed" },
  transport: { label: "Transport", color: "#3b82f6", icon: "Car" },
  entertainment: { label: "Entertainment", color: "#a855f7", icon: "Gamepad2" },
  shopping: { label: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
  bills: { label: "Bills & Utilities", color: "#ef4444", icon: "FileText" },
  education: { label: "Education", color: "#06b6d4", icon: "GraduationCap" },
  health: { label: "Health", color: "#14b8a6", icon: "Heart" },
  rent: { label: "Rent", color: "#f59e0b", icon: "Home" },
  subscriptions: { label: "Subscriptions", color: "#8b5cf6", icon: "CreditCard" },
  personal: { label: "Personal", color: "#64748b", icon: "User" },
  savings: { label: "Savings", color: "#10b981", icon: "PiggyBank" },
  income: { label: "Income", color: "#22d3ee", icon: "DollarSign" },
  other: { label: "Other", color: "#94a3b8", icon: "MoreHorizontal" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export const EXPENSE_CATEGORIES = CATEGORY_KEYS.filter(
  (k) => k !== "income"
);
