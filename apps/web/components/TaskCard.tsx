"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import type { Task } from "@taskhub/shared";
import { CATEGORY_LABELS, formatMoney } from "@taskhub/shared";
import { StatusPill } from "./ui/StatusPill";
import { CategoryIcon } from "./CategoryIcon";

const TaskMapThumbnail = dynamic(() => import("./TaskMapThumbnail").then((m) => m.TaskMapThumbnail), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-canvas-soft" />,
});

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group flex flex-col rounded-lg bg-canvas border border-black/[0.06] overflow-hidden hover:shadow-level1 transition-shadow"
    >
      <div className="relative aspect-[16/10] bg-canvas-soft overflow-hidden pointer-events-none">
        <TaskMapThumbnail lat={task.location.lat} lng={task.location.lng} />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.06]" />
        <div className="absolute top-sm left-sm">
          <StatusPill status={task.status} />
        </div>
        <div className="absolute bottom-sm left-sm bg-canvas/90 backdrop-blur rounded-pill px-sm py-xxs text-caption text-ink font-text font-medium">
          {task.location.city}
        </div>
      </div>
      <div className="p-md flex flex-col gap-xs flex-1">
        <span className="inline-flex items-center gap-xs text-caption text-mute">
          <CategoryIcon category={task.category} size={13} />
          {CATEGORY_LABELS[task.category]}
        </span>
        <h3 className="text-body-sm-strong text-ink line-clamp-2">{task.title}</h3>
        <div className="mt-auto pt-xxs flex items-center text-caption text-body">
          <span className="inline-flex items-center gap-xxs">
            <Clock size={12} />
            {task.timeline}
          </span>
        </div>
        <p className="text-body-sm-strong text-ink">
          {formatMoney(task.budgetMin, task.location.country)} – {formatMoney(task.budgetMax, task.location.country)}
        </p>
      </div>
    </Link>
  );
}
