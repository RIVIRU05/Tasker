import Link from "next/link";
import { CATEGORY_LABELS } from "@taskhub/shared";
import type { TaskCategory } from "@taskhub/shared";
import { CategoryIcon } from "@/components/CategoryIcon";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

const DESCRIPTIONS: Record<TaskCategory, string> = {
  plumbing: "Leak repairs, pipe installation, bathroom fittings, water heater setup.",
  electrical: "Wiring, panel upgrades, inverter/solar setup, fixture installation.",
  painting: "Interior & exterior painting, waterproofing, texture finishes.",
  moving: "House shifting, office relocation, furniture assembly and transport.",
  cleaning: "Deep cleaning, move-in/move-out cleans, recurring housekeeping.",
  carpentry: "Custom furniture, built-in wardrobes, door and window repairs.",
  welding: "Gates, grills, staircase railings, structural steel work.",
  gardening: "Lawn maintenance, hedge trimming, garden design and irrigation.",
  appliance_repair: "Washing machines, refrigerators, AC units, general appliance diagnosis.",
  other: "Anything else: post a task and describe what you need.",
};

export default function ServicesPage() {
  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="max-w-2xl">
        <h1 className="text-display-xl font-display text-ink">Services</h1>
        <p className="text-body-lg text-body mt-lg">
          Every category on Tasker, staffed by verified local workers. Don&apos;t see exactly what
          you need? Post it as &quot;Other&quot; and describe the job.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2xl mt-3xl">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/tasks?category=${cat}`}
            className="rounded-xl border border-black/[0.06] p-2xl hover:shadow-level1 transition-shadow"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-100 text-accent-700 mb-lg">
              <CategoryIcon category={cat} size={20} />
            </span>
            <h3 className="text-display-sm font-display text-ink">{CATEGORY_LABELS[cat]}</h3>
            <p className="text-body-sm text-body mt-sm">{DESCRIPTIONS[cat]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
