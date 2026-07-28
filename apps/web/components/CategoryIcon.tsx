import {
  Wrench,
  Zap,
  Paintbrush,
  Truck,
  Sparkles,
  Hammer,
  Flame,
  Leaf,
  Settings,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";
import type { TaskCategory } from "@taskhub/shared";

const ICONS: Record<TaskCategory, LucideIcon> = {
  plumbing: Wrench,
  electrical: Zap,
  painting: Paintbrush,
  moving: Truck,
  cleaning: Sparkles,
  carpentry: Hammer,
  welding: Flame,
  gardening: Leaf,
  appliance_repair: Settings,
  other: Grid3x3,
};

export function CategoryIcon({ category, size = 18, className = "" }: { category: TaskCategory; size?: number; className?: string }) {
  const Icon = ICONS[category] ?? Grid3x3;
  return <Icon size={size} className={className} />;
}
