"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { MapPin, Clock3, CheckCircle2 } from "lucide-react";
import { getClient } from "@taskhub/data";
import { CATEGORY_LABELS } from "@taskhub/shared";
import type { Rating, User } from "@taskhub/shared";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { BadgeRow } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Pill } from "@/components/ui/Pill";

export default function WorkerProfilePage() {
  const params = useParams<{ id: string }>();
  const [worker, setWorker] = useState<User | null | undefined>(undefined);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const client = getClient();
    client.getUser(params.id).then((found) => {
      setWorker(found ?? null);
      if (found) client.getRatingsForUser(found.id).then(setRatings);
    });
  }, [params.id]);

  if (worker === undefined) {
    return <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-body-md text-body">Loading…</div>;
  }
  if (!worker || !worker.workerProfile) notFound();

  const profile = worker.workerProfile;

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="grid lg:grid-cols-3 gap-2xl items-start">
        <div className="lg:col-span-2 flex flex-col gap-2xl">
          <div className="flex items-center gap-lg">
            <Avatar src={worker.photo} name={worker.name} size={72} />
            <div>
              <h1 className="text-display-lg font-display text-ink">{worker.name}</h1>
              <div className="flex items-center gap-lg mt-xs text-body-sm text-body">
                <span className="inline-flex items-center gap-xs">
                  <MapPin size={14} /> {worker.location}
                </span>
                <span className="inline-flex items-center gap-xs">
                  <Clock3 size={14} /> Responds in ~{profile.responseTimeMinutes} min
                </span>
              </div>
            </div>
          </div>

          <BadgeRow badges={profile.badges} />

          <Card variant="content" className="border border-black/[0.06]">
            <h2 className="text-display-sm font-display text-ink mb-md">About</h2>
            <p className="text-body-md text-body">{profile.bio || "This worker hasn't added a bio yet."}</p>
            <div className="flex flex-wrap gap-sm mt-lg">
              {profile.skills.map((skill: (typeof profile.skills)[number]) => (
                <Pill key={skill} icon={<CategoryIcon category={skill} size={14} />}>
                  {CATEGORY_LABELS[skill]}
                </Pill>
              ))}
            </div>
          </Card>

          {profile.portfolio.length > 0 && (
            <div>
              <h2 className="text-display-sm font-display text-ink mb-lg">Portfolio</h2>
              <div className="grid sm:grid-cols-2 gap-lg">
                {profile.portfolio.map((photo: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-canvas-soft">
                    <Image src={photo} alt="Portfolio work" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-display-sm font-display text-ink mb-lg">
              Reviews ({ratings.length})
            </h2>
            <div className="flex flex-col gap-lg">
              {ratings.length === 0 && <p className="text-body-md text-mute">No reviews yet.</p>}
              {ratings.map((rating) => (
                <Card key={rating.id} variant="content" className="border border-black/[0.06]">
                  <StarRating value={rating.stars} showValue={false} />
                  <p className="text-body-md text-ink mt-sm">{rating.review}</p>
                  <p className="text-caption text-mute mt-sm">
                    {new Date(rating.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-lg lg:sticky lg:top-[96px]">
          <Card variant="elevated">
            <StarRating value={profile.rating.avgStars} reviewCount={profile.rating.totalReviews} size={18} />
            <div className="grid grid-cols-2 gap-lg mt-lg pt-lg border-t border-black/[0.06]">
              <div>
                <p className="text-display-sm font-display text-ink">{profile.rating.completedJobs}</p>
                <p className="text-body-sm text-body">Jobs completed</p>
              </div>
              <div>
                <p className="text-display-sm font-display text-ink">{Math.round(profile.completionRate * 100)}%</p>
                <p className="text-body-sm text-body">Completion rate</p>
              </div>
              <div>
                <p className="text-display-sm font-display text-ink">{profile.yearsExperience}</p>
                <p className="text-body-sm text-body">Years experience</p>
              </div>
              <div>
                <p className="text-display-sm font-display text-ink">{worker.isStudent ? "9%" : "12%"}</p>
                <p className="text-body-sm text-body">Platform fee</p>
              </div>
            </div>
            {profile.paymentMethods.length > 0 && (
              <div className="mt-lg pt-lg border-t border-black/[0.06]">
                <p className="text-body-sm-strong text-ink mb-sm">Accepted payment</p>
                <div className="flex flex-col gap-xs">
                  {profile.paymentMethods.map((pm: (typeof profile.paymentMethods)[number]) => (
                    <span key={pm.label} className="inline-flex items-center gap-xs text-body-sm text-body">
                      <CheckCircle2 size={14} className="text-success" /> {pm.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
