"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getClient } from "@taskhub/data";
import type { Bid, Task } from "@taskhub/shared";
import { CATEGORY_LABELS, formatMoney } from "@taskhub/shared";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function DashboardPage() {
  const { user, loading, logout } = useSession();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<(Bid & { task?: Task })[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Task[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const client = getClient();
    const allTasks = await client.getTasks();
    setMyTasks(allTasks.filter((t) => t.customerId === user.id));

    if (user.workerProfile) {
      const bids = await client.getBidsByWorker(user.id);
      const bidsWithTasks = await Promise.all(
        bids.map(async (b) => ({ ...b, task: await client.getTask(b.taskId) }))
      );
      setMyBids(bidsWithTasks);
      setAssignedJobs(allTasks.filter((t) => t.workerId === user.id));
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loading && !user) {
    return (
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <h1 className="text-display-lg font-display text-ink">Log in to see your dashboard</h1>
        <Button href="/login" variant="primary" className="mt-lg">
          Log in
        </Button>
      </div>
    );
  }

  if (!user) return null;

  const totalEarnings = assignedJobs
    .filter((t) => t.paymentStatus === "released")
    .reduce((sum, t) => sum + t.workerAmount, 0);

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="flex items-center justify-between mb-3xl flex-wrap gap-lg">
        <div>
          <h1 className="text-display-lg font-display text-ink">Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-body-md text-body mt-xs">
            {user.userType === "customer" && "Manage the tasks you've posted."}
            {user.userType === "worker" && "Track your bids and active jobs."}
            {user.userType === "both" && "Manage your posted tasks and worker activity."}
          </p>
        </div>
        <div className="flex items-center gap-md">
          <Button href="/tasks/new" variant="subtle">
            Post a task
          </Button>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      <section className="mb-3xl">
        <h2 className="text-display-sm font-display text-ink mb-lg">My posted tasks ({myTasks.length})</h2>
        {myTasks.length === 0 ? (
          <Card variant="soft">
            <p className="text-body-md text-body">You haven&apos;t posted any tasks yet.</p>
            <Button href="/tasks/new" variant="primary" className="mt-lg">
              Post your first task
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-md">
            {myTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between gap-lg rounded-xl border border-black/[0.06] p-lg hover:shadow-level1 transition-shadow"
              >
                <div className="min-w-0">
                  <p className="text-body-md-strong text-ink truncate">{task.title}</p>
                  <p className="text-body-sm text-body mt-xs">
                    {CATEGORY_LABELS[task.category]} · {formatMoney(task.budgetMin, task.location.country)}–
                    {formatMoney(task.budgetMax, task.location.country)}
                  </p>
                </div>
                <StatusPill status={task.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {user.workerProfile && (
        <>
          <section className="mb-3xl">
            <Card variant="on-dark" className="flex items-center justify-between flex-wrap gap-lg">
              <div>
                <p className="text-body-sm text-white/70">Total earnings</p>
                <p className="text-display-lg font-display text-on-dark mt-xs">{formatMoney(totalEarnings, "AU")}</p>
              </div>
              <div className="text-right">
                <p className="text-body-sm text-white/70">Jobs completed</p>
                <p className="text-display-sm font-display text-on-dark mt-xs">
                  {user.workerProfile.rating.completedJobs}
                </p>
              </div>
            </Card>
          </section>

          <section className="mb-3xl">
            <h2 className="text-display-sm font-display text-ink mb-lg">Active jobs ({assignedJobs.length})</h2>
            {assignedJobs.length === 0 ? (
              <Card variant="soft">
                <p className="text-body-md text-body">No active jobs yet. Browse open tasks to place a bid.</p>
                <Button href="/tasks" variant="primary" className="mt-lg">
                  Browse tasks
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-md">
                {assignedJobs.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between gap-lg rounded-xl border border-black/[0.06] p-lg hover:shadow-level1 transition-shadow"
                  >
                    <div className="min-w-0 flex items-center gap-md">
                      <CategoryIcon category={task.category} size={18} className="text-mute shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-md-strong text-ink truncate">{task.title}</p>
                        <p className="text-body-sm text-body mt-xs">
                          {formatMoney(task.paymentAmount, task.location.country)} agreed
                        </p>
                      </div>
                    </div>
                    <StatusPill status={task.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-lg">
              <h2 className="text-display-sm font-display text-ink">My bids ({myBids.length})</h2>
              <StarRating value={user.workerProfile.rating.avgStars} reviewCount={user.workerProfile.rating.totalReviews} />
            </div>
            {myBids.length === 0 ? (
              <Card variant="soft">
                <p className="text-body-md text-body">You haven&apos;t submitted any bids yet.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-md">
                {myBids.map((bid) => (
                  <Link
                    key={bid.id}
                    href={`/tasks/${bid.taskId}`}
                    className="flex items-center justify-between gap-lg rounded-xl border border-black/[0.06] p-lg hover:shadow-level1 transition-shadow"
                  >
                    <div className="min-w-0">
                      <p className="text-body-md-strong text-ink truncate">{bid.task?.title ?? "Task"}</p>
                      <p className="text-body-sm text-body mt-xs">
                        Your bid: {formatMoney(bid.offeredPrice, bid.task?.location.country)}
                      </p>
                    </div>
                    <span
                      className={`text-body-sm-strong px-lg py-sm rounded-pill ${
                        bid.status === "accepted"
                          ? "bg-success/10 text-success"
                          : bid.status === "rejected"
                          ? "bg-danger/10 text-danger"
                          : "bg-canvas-soft text-ink"
                      }`}
                    >
                      {bid.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
