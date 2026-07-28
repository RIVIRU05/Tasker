import type { TaskStatus } from "@taskhub/shared";
import { Pill } from "./Pill";

const STATUS_META: Record<TaskStatus, { label: string; tone: "neutral" | "accent" | "success" | "danger" | "primary" }> = {
  open: { label: "Open for bids", tone: "accent" },
  assigned: { label: "Assigned", tone: "neutral" },
  in_progress: { label: "In progress", tone: "primary" },
  completed: { label: "Completed", tone: "success" },
  disputed: { label: "Disputed", tone: "danger" },
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return <Pill label={meta.label} tone={meta.tone} />;
}
