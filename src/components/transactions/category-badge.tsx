import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";

export function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES[category as CategoryKey];
  const label = cat?.label ?? category;
  const color = cat?.color ?? "#94a3b8";

  return (
    <Badge
      variant="outline"
      className="text-xs font-normal"
      style={{ borderColor: color, color }}
    >
      {label}
    </Badge>
  );
}
