"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  MessageSquare,
  Wallet,
  Target,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/chat", label: "SpendSense Chat", icon: MessageSquare },
  { href: "/income", label: "Income Tracker", icon: Wallet },
  { href: "/goals", label: "Savings Goals", icon: Target },
];

function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        Dark Mode
      </div>
      <Switch checked={dark} onCheckedChange={toggle} />
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Wallet className="h-5 w-5 text-emerald-600" />
          <span>SpendSense</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t p-4">
        <DarkModeToggle />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center border-b px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center border-b px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
              onClick={() => setOpen(false)}
            >
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span>SpendSense</span>
            </Link>
          </div>
          <div className="flex-1 p-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t p-4">
            <DarkModeToggle />
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="ml-2 flex items-center gap-2 font-bold text-lg">
        <Wallet className="h-5 w-5 text-emerald-600" />
        <span>SpendSense</span>
      </Link>
    </div>
  );
}
