"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { getClient } from "@taskhub/data";
import type { Bid, Task, User } from "@taskhub/shared";
import { CATEGORY_LABELS, formatLKR } from "@taskhub/shared";
import { useSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { StatusPill } from "@/components/ui/StatusPill";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeRow } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ChatPanel } from "@/components/ChatPanel";
import { RatingForm } from "@/components/RatingForm";
import { PhotoUploadInput } from "@/components/PhotoUploadInput";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();

  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidders, setBidders] = useState<Record<string, User>>({});
  const [customer, setCustomer] = useState<User | null>(null);
  const [worker, setWorker] = useState<User | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const load = useCallback(async () => {
    const client = getClient();
    const t = await client.getTask(params.id);
    if (!t) {
      setTask(null);
      return;
    }
    setTask(t);
    const [taskBids, cust] = await Promise.all([client.getBidsForTask(t.id), client.getUser(t.customerId)]);
    setCustomer(cust ?? null);
    if (t.workerId) {
      const w = await client.getUser(t.workerId);
      setWorker(w ?? null);
    } else {
      setWorker(null);
    }
    const bidderEntries = await Promise.all(
      taskBids.map(async (b: Bid) => [b.workerId, await client.getUser(b.workerId)] as const)
    );
    const bidderMap: Record<string, User> = {};
    bidderEntries.forEach(([id, u]: readonly [string, User | undefined]) => {
      if (u) bidderMap[id] = u;
    });
    setBidders(bidderMap);
    setBids(
      taskBids.sort((a: Bid, b: Bid) => {
        const ra = bidderMap[a.workerId]?.workerProfile?.rating.avgStars ?? 0;
        const rb = bidderMap[b.workerId]?.workerProfile?.rating.avgStars ?? 0;
        return rb - ra;
      })
    );
    if (user) {
      const ratings = await client.getRatingsForUser(t.workerId ?? "");
      setAlreadyRated(ratings.some((r) => r.taskId === t.id && r.ratedById === user.id));
    }
  }, [params.id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (task === undefined) {
    return <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-body-md text-body">Loading…</div>;
  }
  if (task === null) {
    return (
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <p className="text-display-sm font-display text-ink">Task not found</p>
        <Button href="/tasks" variant="primary" className="mt-lg">
          Back to browse
        </Button>
      </div>
    );
  }

  const isCustomer = user?.id === task.customerId;
  const isAssignedWorker = user?.id === task.workerId;
  const hasBid = bids.some((b) => b.workerId === user?.id);
  const canBid = user?.workerProfile && task.status === "open" && !isCustomer && !hasBid;

  if (task.status !== "open" && !isCustomer && !isAssignedWorker && !isAdmin(user)) {
    return (
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <p className="text-display-sm font-display text-ink">This task is no longer available</p>
        <p className="text-body-md text-body mt-sm">
          It's been assigned and is now only visible to the customer and worker involved.
        </p>
        <Button href="/tasks" variant="primary" className="mt-lg">
          Back to browse
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="grid lg:grid-cols-3 gap-2xl items-start">
        <div className="lg:col-span-2 flex flex-col gap-2xl">
          {task.status === "disputed" && (
            <Card variant="content" className="border border-danger/30 bg-danger/5 flex items-start gap-md">
              <AlertTriangle className="text-danger shrink-0" size={20} />
              <div>
                <p className="text-body-md-strong text-ink">This task is under dispute review</p>
                <p className="text-body-sm text-body mt-xs">
                  Tasker is reviewing evidence from both sides. Resolution typically takes 3–5 days.
                </p>
              </div>
            </Card>
          )}

          <div>
            <div className="flex items-center gap-md mb-md">
              <StatusPill status={task.status} />
              <span className="inline-flex items-center gap-xs text-body-sm text-body">
                <CategoryIcon category={task.category} size={15} />
                {CATEGORY_LABELS[task.category]}
              </span>
            </div>
            <h1 className="text-display-xl font-display text-ink">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-lg mt-lg text-body-sm text-body">
              <span className="inline-flex items-center gap-xs">
                <MapPin size={15} /> {task.location.city}
              </span>
              <span className="inline-flex items-center gap-xs">
                <Clock size={15} /> {task.timeline}
                {task.scheduledDate ? ` · ${task.scheduledDate}` : ""}
              </span>
            </div>
          </div>

          {task.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-md">
              {task.photos.map((photo: string, i: number) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-canvas-soft">
                  <Image src={photo} alt={task.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <Card variant="content" className="border border-black/[0.06]">
            <h2 className="text-display-sm font-display text-ink mb-md">Description</h2>
            <p className="text-body-md text-body whitespace-pre-line">{task.description}</p>
          </Card>

          {customer && (
            <Card variant="soft">
              <p className="text-body-sm-strong text-mute mb-md">Posted by</p>
              <div className="flex items-center gap-md">
                <Avatar src={customer.photo} name={customer.name} size={44} />
                <div>
                  <p className="text-body-md-strong text-ink">{customer.name}</p>
                  <p className="text-body-sm text-body">{customer.location}</p>
                </div>
              </div>
            </Card>
          )}

          {task.completionPhotos.length > 0 && (
            <Card variant="content" className="border border-black/[0.06]">
              <h2 className="text-display-sm font-display text-ink mb-md">Completion photos</h2>
              <div className="grid grid-cols-2 gap-md">
                {task.completionPhotos.map((photo: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-canvas-soft">
                    <Image src={photo} alt="Completed work" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bids */}
          {task.status === "open" && (
            <div>
              <h2 className="text-display-sm font-display text-ink mb-lg">
                {bids.length} bid{bids.length === 1 ? "" : "s"}
              </h2>
              <div className="flex flex-col gap-lg">
                {bids.map((bid) => {
                  const bidder = bidders[bid.workerId];
                  if (!bidder) return null;
                  return (
                    <BidRow
                      key={bid.id}
                      bid={bid}
                      bidder={bidder}
                      canAccept={isCustomer && task.status === "open"}
                      onAccepted={load}
                    />
                  );
                })}
                {bids.length === 0 && <p className="text-body-md text-mute">No bids yet.</p>}
              </div>
            </div>
          )}

          {canBid && <BidForm taskId={task.id} workerId={user!.id} onSubmitted={load} />}

          {/* Chat */}
          {task.workerId && customer && worker && user && (user.id === task.customerId || user.id === task.workerId) && (
            <div>
              <h2 className="text-display-sm font-display text-ink mb-lg">Messages</h2>
              <ChatPanel taskId={task.id} currentUser={user} otherUser={user.id === task.customerId ? worker : customer} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-lg lg:sticky lg:top-[96px]">
          <Card variant="elevated">
            <p className="text-body-sm text-mute">Budget</p>
            <p className="text-display-sm font-display text-ink mt-xs">
              {formatLKR(task.budgetMin)} – {formatLKR(task.budgetMax)}
            </p>
            {task.paymentAmount > 0 && (
              <p className="text-body-sm text-body mt-sm">Agreed price: {formatLKR(task.paymentAmount)}</p>
            )}

            <div className="flex flex-col gap-sm mt-lg">
              <TaskActions task={task} currentUser={user} onChange={load} alreadyRated={alreadyRated} />
            </div>

            <div className="flex items-center gap-sm text-caption text-mute mt-lg pt-lg border-t border-black/[0.06]">
              <ShieldCheck size={14} /> Payments held in escrow until you approve
            </div>
          </Card>

          {worker && (
            <Link href={`/workers/${worker.id}`} className="block">
              <Card variant="content" className="border border-black/[0.06] hover:shadow-level1 transition-shadow">
                <p className="text-body-sm-strong text-mute mb-md">Assigned worker</p>
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
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function BidRow({
  bid,
  bidder,
  canAccept,
  onAccepted,
}: {
  bid: Bid;
  bidder: User;
  canAccept: boolean;
  onAccepted: () => void;
}) {
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    await getClient().acceptBid(bid.id);
    setAccepting(false);
    onAccepted();
  }

  return (
    <Card variant="content" className="border border-black/[0.06]">
      <div className="flex items-start justify-between gap-lg">
        <Link href={`/workers/${bidder.id}`} className="flex items-center gap-md">
          <Avatar src={bidder.photo} name={bidder.name} size={44} />
          <div>
            <p className="text-body-md-strong text-ink">{bidder.name}</p>
            <StarRating
              value={bidder.workerProfile?.rating.avgStars ?? 0}
              reviewCount={bidder.workerProfile?.rating.totalReviews}
            />
          </div>
        </Link>
        <p className="text-display-sm font-display text-ink whitespace-nowrap">{formatLKR(bid.offeredPrice)}</p>
      </div>
      {bidder.workerProfile && <BadgeRow badges={bidder.workerProfile.badges} />}
      <p className="text-body-md text-body mt-md">{bid.message}</p>
      {canAccept && (
        <Button variant="primary" className="mt-lg" onClick={handleAccept} disabled={accepting}>
          {accepting ? "Accepting…" : "Accept bid"}
        </Button>
      )}
    </Card>
  );
}

function BidForm({ taskId, workerId, onSubmitted }: { taskId: string; workerId: string; onSubmitted: () => void }) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await getClient().submitBid({ taskId, workerId, offeredPrice: Number(price), message });
    setSubmitting(false);
    setPrice("");
    setMessage("");
    onSubmitted();
  }

  return (
    <Card variant="soft">
      <h3 className="text-display-sm font-display text-ink mb-lg">Submit a bid</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
        <Input
          id="price"
          type="number"
          label="Your price (LKR)"
          required
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Textarea
          id="message"
          label="Message"
          required
          placeholder="Explain your approach, availability, or ask a question…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit bid"}
        </Button>
      </form>
    </Card>
  );
}

function TaskActions({
  task,
  currentUser,
  onChange,
  alreadyRated,
}: {
  task: Task;
  currentUser: User | null;
  onChange: () => void;
  alreadyRated: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  if (!currentUser) {
    return <Button href="/login" variant="primary" className="w-full justify-center">Log in to take action</Button>;
  }

  const isCustomer = currentUser.id === task.customerId;
  const isWorker = currentUser.id === task.workerId;

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    onChange();
  }

  if (isWorker && task.status === "assigned") {
    return (
      <Button
        variant="primary"
        className="w-full justify-center"
        disabled={busy}
        onClick={() => run(() => getClient().updateTask(task.id, { status: "in_progress" }))}
      >
        {busy ? "Starting…" : "Start job"}
      </Button>
    );
  }

  if (isWorker && task.status === "in_progress") {
    if (!showComplete) {
      return (
        <Button variant="primary" className="w-full justify-center" onClick={() => setShowComplete(true)}>
          Mark as complete
        </Button>
      );
    }
    return (
      <div className="flex flex-col gap-sm">
        <PhotoUploadInput
          label="Completion photos"
          pathPrefix={`completion-photos/${task.id}`}
          value={photos}
          onChange={setPhotos}
          multiple
          hint="Show the finished work — the customer sees these before releasing payment."
        />
        <Button
          variant="primary"
          className="w-full justify-center"
          disabled={busy}
          onClick={() =>
            run(() =>
              getClient().markTaskComplete(task.id, photos.length > 0 ? photos : [`/placeholders/${task.category}.png`])
            )
          }
        >
          {busy ? "Submitting…" : "Submit completion"}
        </Button>
      </div>
    );
  }

  if (isCustomer && task.status === "completed" && task.paymentStatus === "escrow") {
    return (
      <div className="flex flex-col gap-sm">
        <Button
          variant="primary"
          className="w-full justify-center"
          disabled={busy}
          onClick={() => run(() => getClient().approveCompletion(task.id))}
        >
          {busy ? "Releasing…" : "Approve & release payment"}
        </Button>
        <DisputeAction task={task} currentUser={currentUser} onChange={onChange} />
      </div>
    );
  }

  if (task.status === "completed" && task.paymentStatus === "released" && task.workerId) {
    if (alreadyRated) {
      return <p className="text-body-sm text-body">You&apos;ve already reviewed this job.</p>;
    }
    if (isCustomer) {
      return (
        <RatingForm
          taskId={task.id}
          ratedById={currentUser.id}
          ratedUserId={task.workerId}
          ratingType="worker"
          onSubmitted={onChange}
        />
      );
    }
    if (isWorker) {
      return (
        <RatingForm
          taskId={task.id}
          ratedById={currentUser.id}
          ratedUserId={task.customerId}
          ratingType="customer"
          onSubmitted={onChange}
        />
      );
    }
  }

  if (task.status === "assigned" || task.status === "in_progress") {
    return <p className="text-body-sm text-body">This task is already assigned.</p>;
  }

  if (task.status === "open" && isCustomer) {
    return <p className="text-body-sm text-body">Waiting for bids — accept one below to get started.</p>;
  }

  return null;
}

function DisputeAction({
  task,
  currentUser,
  onChange,
}: {
  task: Task;
  currentUser: User;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!task.workerId) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body-sm text-danger underline text-center w-full"
      >
        Report a problem with this work
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await getClient().createDispute({
      taskId: task.id,
      customerId: currentUser.id,
      workerId: task.workerId!,
      customerDescription: description,
    });
    setSubmitting(false);
    onChange();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-sm border-t border-black/[0.06] pt-lg mt-sm">
      <Textarea
        id="dispute-description"
        label="What's wrong?"
        required
        placeholder="Describe the issue — the more detail, the faster this gets resolved."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" variant="secondary" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit dispute"}
      </Button>
    </form>
  );
}
