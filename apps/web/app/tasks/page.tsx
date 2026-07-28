"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getClient } from "@taskhub/data";
import type { Task, TaskCategory } from "@taskhub/shared";
import { CATEGORY_LABELS } from "@taskhub/shared";
import { TaskCard } from "@/components/TaskCard";
import { CategoryIcon } from "@/components/CategoryIcon";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

export default function BrowseTasksPage() {
  return (
    <Suspense fallback={null}>
      <BrowseTasksInner />
    </Suspense>
  );
}

function BrowseTasksInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const category = (searchParams.get("category") as TaskCategory | null) ?? null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    getClient()
      .getTasks({ status: "open", category: category ?? undefined, query: query || undefined })
      .then((result) => {
        if (active) setTasks(result);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, query]);

  const setCategory = (cat: TaskCategory | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.push(`/tasks?${params.toString()}`);
  };

  const resultLabel = useMemo(() => `${tasks.length} task${tasks.length === 1 ? "" : "s"}`, [tasks.length]);

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-lg mb-2xl">
        <div>
          <h1 className="text-display-xl font-display text-ink">Browse tasks</h1>
          <p className="text-body-md text-body mt-sm">{resultLabel} open across Colombo &amp; Kandy</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search size={18} className="absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="w-full bg-canvas-soft rounded-pill pl-[44px] pr-lg py-md text-body-md outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-md overflow-x-auto no-scrollbar pb-2xl">
        <button
          onClick={() => setCategory(null)}
          className={`rounded-pill px-lg py-sm text-body-sm-strong whitespace-nowrap shrink-0 ${
            !category ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-ink hover:bg-surface-pressed"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`inline-flex items-center gap-sm rounded-pill px-lg py-sm text-body-sm-strong whitespace-nowrap shrink-0 ${
              category === cat ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-ink hover:bg-surface-pressed"
            }`}
          >
            <CategoryIcon category={cat} size={15} />
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md sm:gap-lg">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-canvas-soft animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-3xl">
          <p className="text-body-lg text-body">No tasks match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md sm:gap-lg">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
