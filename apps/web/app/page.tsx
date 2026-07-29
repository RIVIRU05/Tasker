"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Clock3, Lock, Star, ChevronRight } from "lucide-react";
import { getClient } from "@taskhub/data";
import { CATEGORY_LABELS } from "@taskhub/shared";
import type { Task, TaskCategory, User } from "@taskhub/shared";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { BadgeRow } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TaskCard } from "@/components/TaskCard";
import { useCountry } from "@/lib/country";

const CATEGORIES: TaskCategory[] = [
  "plumbing",
  "electrical",
  "painting",
  "moving",
  "cleaning",
  "carpentry",
  "welding",
  "gardening",
];

export default function HomePage() {
  const { country } = useCountry();
  const [featuredTasks, setFeaturedTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  useEffect(() => {
    const client = getClient();
    Promise.all([client.getTasks({ status: "open", country }), client.getLeaderboard(4)]).then(([tasks, top]) => {
      setFeaturedTasks(tasks.slice(0, 5));
      setLeaderboard(top);
    });
  }, [country]);

  return (
    <div>
      <section className="bg-canvas">
        <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl lg:py-[64px] grid lg:grid-cols-2 gap-3xl items-center">
          <div>
            <h1 className="text-display-xl lg:text-display-xxl font-display text-ink max-w-xl">
              Get it done by trusted local pros
            </h1>
            <p className="text-body-lg text-body mt-lg max-w-md">
              Post any task, from plumbing and electrical to painting and moving, and get bids
              from verified workers in Colombo and Kandy within minutes.
            </p>
            <div className="flex flex-wrap items-center gap-md mt-2xl">
              <Button href="/tasks/new" variant="primary" size="lg">
                Post a task <ArrowRight size={18} />
              </Button>
              <Button href="/tasks" variant="secondary" size="lg">
                Browse tasks
              </Button>
            </div>
            <div className="flex items-center gap-xl mt-3xl text-body-sm text-body">
              <span className="font-text font-medium text-ink">4.8★ average rating</span>
              <span className="w-1 h-1 rounded-full bg-mute" />
              <span>1,200+ jobs completed</span>
              <span className="w-1 h-1 rounded-full bg-mute" />
              <span>0% commission surprises</span>
            </div>
          </div>

          <Card variant="elevated" className="max-w-[490px] w-full ml-auto">
            <h2 className="text-display-sm font-display text-ink">Post a task in 3 steps</h2>
            <div className="flex flex-col gap-sm mt-lg">
              <div className="flex items-center gap-md rounded-md bg-canvas-soft p-lg">
                <span className="w-8 h-8 rounded-full bg-accent-500 text-on-dark flex items-center justify-center text-body-sm-strong shrink-0">
                  1
                </span>
                <div>
                  <p className="text-body-md-strong text-ink">Describe your task</p>
                  <p className="text-body-sm text-body">Category, photos, budget, location</p>
                </div>
              </div>
              <div className="flex items-center gap-md rounded-md bg-canvas-soft p-lg">
                <span className="w-8 h-8 rounded-full bg-accent-500 text-on-dark flex items-center justify-center text-body-sm-strong shrink-0">
                  2
                </span>
                <div>
                  <p className="text-body-md-strong text-ink">Compare bids</p>
                  <p className="text-body-sm text-body">Workers bid with price + message</p>
                </div>
              </div>
              <div className="flex items-center gap-md rounded-md bg-canvas-soft p-lg">
                <span className="w-8 h-8 rounded-full bg-accent-500 text-on-dark flex items-center justify-center text-body-sm-strong shrink-0">
                  3
                </span>
                <div>
                  <p className="text-body-md-strong text-ink">Pay securely on completion</p>
                  <p className="text-body-sm text-body">Funds held in escrow until you approve</p>
                </div>
              </div>
            </div>
            <Button href="/tasks/new" variant="large" className="w-full mt-lg justify-center">
              Post a task, it&apos;s free
            </Button>
          </Card>
        </div>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <div className="flex items-center gap-md overflow-x-auto no-scrollbar pb-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/tasks?category=${cat}`}
              className="inline-flex items-center gap-sm rounded-pill bg-canvas-soft px-lg py-sm text-body-sm-strong text-ink hover:bg-surface-pressed whitespace-nowrap shrink-0"
            >
              <CategoryIcon category={cat} size={16} />
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <div className="grid lg:grid-cols-2 gap-2xl">
          <Card variant="content" className="border border-black/[0.06]">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 mb-lg">
              <Star size={20} />
            </span>
            <h3 className="text-display-md font-display text-ink">Need something done?</h3>
            <p className="text-body-md text-body mt-sm">
              Post your task free, compare bids from rated local workers, and only pay once
              you&apos;re happy with the work.
            </p>
            <Link href="/tasks/new" className="inline-flex items-center gap-xs text-body-md-strong text-ink mt-lg">
              Post a task <ChevronRight size={16} />
            </Link>
          </Card>
          <Card variant="content" className="border border-black/[0.06]">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-100 text-accent-700 mb-lg">
              <ShieldCheck size={20} />
            </span>
            <h3 className="text-display-md font-display text-ink">Skilled with tools?</h3>
            <p className="text-body-md text-body mt-sm">
              Browse open tasks near you, bid what you&apos;re worth, and get paid securely.
              Student workers keep more with a reduced 9% fee.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-xs text-body-md-strong text-ink mt-lg">
              Start earning <ChevronRight size={16} />
            </Link>
          </Card>
        </div>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <Card variant="on-dark" className="grid lg:grid-cols-2 gap-2xl items-center">
          <div>
            <h3 className="text-display-lg font-display text-on-dark">
              Every job is protected, start to finish
            </h3>
            <p className="text-body-md text-white/70 mt-lg max-w-md">
              Payments sit in escrow until you approve the work. Disputes are resolved within
              3–5 days. Workers with under 3.5★ or repeated no-shows are removed automatically.
            </p>
            <div className="flex flex-wrap gap-lg mt-2xl">
              <div className="flex items-center gap-sm text-body-sm-strong text-on-dark">
                <Lock size={16} /> Escrow payments
              </div>
              <div className="flex items-center gap-sm text-body-sm-strong text-on-dark">
                <Clock3 size={16} /> 3–5 day disputes
              </div>
              <div className="flex items-center gap-sm text-body-sm-strong text-on-dark">
                <ShieldCheck size={16} /> Verified workers
              </div>
            </div>
            <Button href="/how-it-works" variant="on-dark" className="mt-2xl">
              See how it works
            </Button>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden hidden lg:block">
            <Image
              src="/placeholders/trust.png"
              alt="Every job on Tasker is protected"
              fill
              className="object-cover"
            />
          </div>
        </Card>
      </section>

      {featuredTasks.length > 0 && (
        <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-display-xl font-display text-ink">Tasks near you</h3>
            <Link href="/tasks" className="inline-flex items-center gap-xs text-body-md-strong text-ink">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md sm:gap-lg">
            {featuredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="text-display-xl font-display text-ink">Top-rated workers</h3>
          <Link href="/leaderboard" className="inline-flex items-center gap-xs text-body-md-strong text-ink">
            Leaderboard <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2xl">
          {leaderboard.map((worker) => (
            <Link
              key={worker.id}
              href={`/workers/${worker.id}`}
              className="rounded-xl border border-black/[0.06] p-lg flex flex-col gap-md hover:shadow-level1 transition-shadow"
            >
              <div className="flex items-center gap-md">
                <Avatar src={worker.photo} name={worker.name} size={48} />
                <div>
                  <p className="text-body-md-strong text-ink">{worker.name}</p>
                  <StarRating
                    value={worker.workerProfile?.rating.avgStars ?? 0}
                    reviewCount={worker.workerProfile?.rating.totalReviews}
                  />
                </div>
              </div>
              {worker.workerProfile && <BadgeRow badges={worker.workerProfile.badges} />}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <Card variant="soft">
          <div className="grid lg:grid-cols-3 gap-2xl">
            <div>
              <h4 className="text-display-sm font-display text-ink">12% platform fee</h4>
              <p className="text-body-sm text-body mt-sm">
                9% for verified student workers. No listing fees, no subscriptions. Tasker
                only earns when you do.
              </p>
            </div>
            <div>
              <h4 className="text-display-sm font-display text-ink">Student discounts</h4>
              <p className="text-body-sm text-body mt-sm">
                Verify with a .ac.lk email for a 10% discount as a customer, or a reduced 9%
                commission as a worker.
              </p>
            </div>
            <div>
              <h4 className="text-display-sm font-display text-ink">Made for Sri Lanka</h4>
              <p className="text-body-sm text-body mt-sm">
                Built around Colombo and Kandy suburbs, LKR pricing, and local payment methods
                like Koko Pay and mobile money.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
