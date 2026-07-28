import { Wrench, Zap, Paintbrush, Truck, Sparkles, Hammer, Flame, Leaf, Settings, Grid3x3 } from "lucide-react-native";
import type { TaskCategory } from "@taskhub/shared";

const ICONS: Record<TaskCategory, typeof Wrench> = {
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

export function CategoryIcon({ category, size = 16, color }: { category: TaskCategory; size?: number; color?: string }) {
  const Icon = ICONS[category] ?? Grid3x3;
  return <Icon size={size} color={color ?? "#5e5e5e"} />;
}
