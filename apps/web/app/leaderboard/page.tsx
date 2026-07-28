"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getClient } from "@taskhub/data";
import { CATEGORY_LABELS } from "@taskhub/shared";
import type { User } from "@taskhub/shared";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { BadgeRow } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function LeaderboardPage() {
  const [workers, setWorkers] = useState<User[]>([]);

  useEffect(() => {
    getClient().getLeaderboard(10).then(setWorkers);
  }, []);

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="text-center max-w-lg mx-auto mb-3xl">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-100 text-accent-700 mb-lg">
          <Trophy size={24} />
        </span>
        <h1 className="text-display-xl font-display text-ink">Top-rated workers</h1>
        <p className="text-body-md text-body mt-sm">
          Ranked by rating and completed jobs. Every worker here has passed Tasker&apos;s verification.
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-md">
        {workers.map((worker, i) => (
          <Link
            key={worker.id}
            href={`/workers/${worker.id}`}
            className="flex flex-col sm:flex-row sm:items-center gap-md sm:gap-lg rounded-xl border border-black/[0.06] p-lg hover:shadow-level1 transition-shadow"
          >
            <div className="flex items-center gap-lg min-w-0">
              <span className="w-8 text-display-sm font-display text-mute text-center shrink-0">{i + 1}</span>
              <Avatar src={worker.photo} name={worker.name} size={52} />
              <div className="flex-1 min-w-0">
                <p className="text-body-lg font-text font-medium text-ink">{worker.name}</p>
                <div className="flex items-center gap-md mt-xs flex-wrap">
                  <StarRating
                    value={worker.workerProfile?.rating.avgStars ?? 0}
                    reviewCount={worker.workerProfile?.rating.totalReviews}
                  />
                  <span className="text-body-sm text-body">
                    {worker.workerProfile?.rating.completedJobs} jobs
                  </span>
                  <span className="inline-flex items-center gap-xs text-body-sm text-body">
                    <CategoryIcon category={worker.workerProfile!.skills[0] ?? "other"} size={13} />
                    {CATEGORY_LABELS[worker.workerProfile!.skills[0] ?? "other"]}
                  </span>
                </div>
              </div>
            </div>
            {worker.workerProfile && (
              <div className="pl-[64px] sm:pl-0 sm:shrink-0">
                <BadgeRow badges={worker.workerProfile.badges} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
