import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Clock, AlertTriangle, ShieldCheck } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { Bid, Task, User } from "@taskhub/shared";
import { CATEGORY_LABELS, formatLKR } from "@taskhub/shared";
import { useSession } from "../lib/session";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { StatusPill } from "../components/ui/StatusPill";
import { StarRating } from "../components/ui/StarRating";
import { Avatar } from "../components/ui/Avatar";
import { BadgeRow } from "../components/BadgeRow";
import { CategoryIcon } from "../components/CategoryIcon";
import { ChatBox } from "../components/ChatBox";
import { RatingForm } from "../components/RatingForm";
import { PhotoPicker } from "../components/PhotoPicker";
import { colors, radius, spacing, type } from "../theme";

export function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { user } = useSession();
  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidders, setBidders] = useState<Record<string, User>>({});
  const [customer, setCustomer] = useState<User | null>(null);
  const [worker, setWorker] = useState<User | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);

  const load = useCallback(async () => {
    const client = getClient();
    const t = await client.getTask(taskId);
    if (!t) {
      setTask(null);
      return;
    }
    setTask(t);
    const [taskBids, cust] = await Promise.all([client.getBidsForTask(t.id), client.getUser(t.customerId)]);
    setCustomer(cust ?? null);
    setWorker(t.workerId ? (await client.getUser(t.workerId)) ?? null : null);

    const bidderMap: Record<string, User> = {};
    await Promise.all(
      taskBids.map(async (b) => {
        const u = await client.getUser(b.workerId);
        if (u) bidderMap[b.workerId] = u;
      })
    );
    setBidders(bidderMap);
    setBids(taskBids.sort((a, b) => (bidderMap[b.workerId]?.workerProfile?.rating.avgStars ?? 0) - (bidderMap[a.workerId]?.workerProfile?.rating.avgStars ?? 0)));

    if (user) {
      const ratings = await client.getRatingsForUser(t.workerId ?? "");
      setAlreadyRated(ratings.some((r) => r.taskId === t.id && r.ratedById === user.id));
    }
  }, [taskId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (task === undefined) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }
  if (task === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Task not found</Text>
      </View>
    );
  }

  const isCustomer = user?.id === task.customerId;
  const isAssignedWorker = user?.id === task.workerId;
  const hasBid = bids.some((b) => b.workerId === user?.id);
  const canBid = user?.workerProfile && task.status === "open" && !isCustomer && !hasBid;

  if (task.status !== "open" && !isCustomer && !isAssignedWorker) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>This task is no longer available</Text>
        <Text style={[styles.loading, { textAlign: "center", marginTop: spacing.sm }]}>
          It&apos;s been assigned and is now only visible to the customer and worker involved.
        </Text>
      </View>
    );
  }

  async function handleAcceptBid(bidId: string) {
    setBusy(true);
    await getClient().acceptBid(bidId);
    setBusy(false);
    load();
  }

  async function handleSubmitBid() {
    if (!user) return;
    setSubmittingBid(true);
    await getClient().submitBid({ taskId: task!.id, workerId: user.id, offeredPrice: Number(bidPrice), message: bidMessage });
    setBidPrice("");
    setBidMessage("");
    setSubmittingBid(false);
    load();
  }

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    load();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {task.status === "disputed" && (
        <Card style={styles.disputeCard}>
          <AlertTriangle size={18} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.disputeTitle}>This task is under dispute review</Text>
            <Text style={styles.disputeText}>TaskHub is reviewing evidence — typically 3–5 days.</Text>
          </View>
        </Card>
      )}

      <View style={styles.headerRow}>
        <StatusPill status={task.status} />
        <View style={styles.categoryRow}>
          <CategoryIcon category={task.category} size={13} />
          <Text style={styles.categoryText}>{CATEGORY_LABELS[task.category]}</Text>
        </View>
      </View>
      <Text style={styles.title}>{task.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={13} color={colors.body} />
          <Text style={styles.metaText}>{task.location.city}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={13} color={colors.body} />
          <Text style={styles.metaText}>{task.timeline}</Text>
        </View>
      </View>

      {task.photos.length > 0 && <Image source={{ uri: task.photos[0] }} style={styles.photo} />}

      <Card>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{task.description}</Text>
      </Card>

      <Card variant="soft">
        <Text style={styles.mutedLabel}>Budget</Text>
        <Text style={styles.budget}>
          {formatLKR(task.budgetMin)} – {formatLKR(task.budgetMax)}
        </Text>
        {task.paymentAmount > 0 && <Text style={styles.body}>Agreed price: {formatLKR(task.paymentAmount)}</Text>}
      </Card>

      {customer && (
        <Card variant="soft">
          <Text style={styles.mutedLabel}>Posted by</Text>
          <View style={styles.personRow}>
            <Avatar src={customer.photo} name={customer.name} size={44} />
            <View>
              <Text style={styles.personName}>{customer.name}</Text>
              <Text style={styles.metaText}>{customer.location}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Task action area */}
      <Card variant="elevated">
        {!user && <Button label="Log in to take action" onPress={() => navigation.navigate("Login")} />}
        {user && isCustomer && task.status === "assigned" && <Text style={styles.body}>This task is already assigned.</Text>}
        {user && isCustomer && task.status === "in_progress" && <Text style={styles.body}>Work is in progress.</Text>}
        {user && isCustomer && task.status === "open" && <Text style={styles.body}>Waiting for bids — accept one below.</Text>}

        {user && user.id === task.workerId && task.status === "assigned" && (
          <Button label={busy ? "Starting…" : "Start job"} onPress={() => run(() => getClient().updateTask(task.id, { status: "in_progress" }))} loading={busy} />
        )}

        {user && user.id === task.workerId && task.status === "in_progress" && !showComplete && (
          <Button label="Mark as complete" onPress={() => setShowComplete(true)} />
        )}
        {user && user.id === task.workerId && task.status === "in_progress" && showComplete && (
          <View style={{ gap: spacing.md }}>
            <PhotoPicker
              label="Completion photos"
              pathPrefix={`completion-photos/${task.id}`}
              value={completionPhotos}
              onChange={setCompletionPhotos}
              multiple
            />
            <Button
              label={busy ? "Submitting…" : "Submit completion"}
              onPress={() =>
                run(() =>
                  getClient().markTaskComplete(
                    task.id,
                    completionPhotos.length > 0 ? completionPhotos : [`https://picsum.photos/seed/${task.id}/800/600`]
                  )
                )
              }
              loading={busy}
            />
          </View>
        )}

        {user && isCustomer && task.status === "completed" && task.paymentStatus === "escrow" && (
          <View style={{ gap: spacing.sm }}>
            <Button label={busy ? "Releasing…" : "Approve & release payment"} onPress={() => run(() => getClient().approveCompletion(task.id))} loading={busy} />
            <DisputeAction task={task} currentUser={user} onChange={load} />
          </View>
        )}

        {task.status === "completed" && task.paymentStatus === "released" && task.workerId && user && (
          alreadyRated ? (
            <Text style={styles.body}>You&apos;ve already reviewed this job.</Text>
          ) : isCustomer ? (
            <RatingForm taskId={task.id} ratedById={user.id} ratedUserId={task.workerId} ratingType="worker" onSubmitted={load} />
          ) : user.id === task.workerId ? (
            <RatingForm taskId={task.id} ratedById={user.id} ratedUserId={task.customerId} ratingType="customer" onSubmitted={load} />
          ) : null
        )}

        <View style={styles.escrowNote}>
          <ShieldCheck size={13} color={colors.mute} />
          <Text style={styles.escrowText}>Payments held in escrow until you approve</Text>
        </View>
      </Card>

      {/* Bids */}
      {task.status === "open" && (
        <View>
          <Text style={styles.sectionTitle}>
            {bids.length} bid{bids.length === 1 ? "" : "s"}
          </Text>
          {bids.map((bid) => {
            const bidder = bidders[bid.workerId];
            if (!bidder) return null;
            return (
              <Card key={bid.id} style={{ marginTop: spacing.md }}>
                <View style={styles.bidHeader}>
                  <View style={styles.personRow}>
                    <Avatar src={bidder.photo} name={bidder.name} size={40} />
                    <View>
                      <Text style={styles.personName}>{bidder.name}</Text>
                      <StarRating value={bidder.workerProfile?.rating.avgStars ?? 0} reviewCount={bidder.workerProfile?.rating.totalReviews} />
                    </View>
                  </View>
                  <Text style={styles.bidPrice}>{formatLKR(bid.offeredPrice)}</Text>
                </View>
                {bidder.workerProfile && <BadgeRow badges={bidder.workerProfile.badges} />}
                <Text style={[styles.body, { marginTop: spacing.sm }]}>{bid.message}</Text>
                {isCustomer && (
                  <Button label={busy ? "Accepting…" : "Accept bid"} onPress={() => handleAcceptBid(bid.id)} loading={busy} style={{ marginTop: spacing.md }} />
                )}
              </Card>
            );
          })}
          {bids.length === 0 && <Text style={styles.body}>No bids yet.</Text>}
        </View>
      )}

      {canBid && (
        <Card variant="soft">
          <Text style={styles.sectionTitle}>Submit a bid</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            <Input label="Your price (LKR)" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />
            <Textarea label="Message" value={bidMessage} onChangeText={setBidMessage} placeholder="Explain your approach…" />
            <Button label={submittingBid ? "Submitting…" : "Submit bid"} onPress={handleSubmitBid} loading={submittingBid} />
          </View>
        </Card>
      )}

      {task.workerId && customer && worker && user && (user.id === task.customerId || user.id === task.workerId) && (
        <ChatBox taskId={task.id} currentUser={user} otherUser={user.id === task.customerId ? worker : customer} />
      )}

      {worker && (
        <Card style={{ marginBottom: spacing.xxxl }}>
          <Text style={styles.mutedLabel}>Assigned worker</Text>
          <View style={styles.personRow}>
            <Avatar src={worker.photo} name={worker.name} size={44} />
            <View>
              <Text style={styles.personName}>{worker.name}</Text>
              <StarRating value={worker.workerProfile?.rating.avgStars ?? 0} reviewCount={worker.workerProfile?.rating.totalReviews} />
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

function DisputeAction({ task, currentUser, onChange }: { task: Task; currentUser: User; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!task.workerId) return null;

  if (!open) {
    return (
      <Text onPress={() => setOpen(true)} style={disputeStyles.link}>
        Report a problem with this work
      </Text>
    );
  }

  async function handleSubmit() {
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
    <View style={disputeStyles.form}>
      <Textarea
        label="What's wrong?"
        placeholder="Describe the issue — the more detail, the faster this gets resolved."
        value={description}
        onChangeText={setDescription}
      />
      <Button label={submitting ? "Submitting…" : "Submit dispute"} variant="secondary" onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const disputeStyles = StyleSheet.create({
  link: { ...type.bodySm, color: colors.danger, textAlign: "center", textDecorationLine: "underline", paddingVertical: spacing.xs },
  form: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: spacing.lg, marginTop: spacing.xs },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  loading: { ...type.bodyMd, color: colors.body },
  disputeCard: { flexDirection: "row", gap: spacing.md, backgroundColor: "#fbe6e6" },
  disputeTitle: { ...type.bodyMdStrong, color: colors.ink },
  disputeText: { ...type.bodySm, color: colors.body, marginTop: spacing.xxs },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  categoryText: { ...type.bodySm, color: colors.body },
  title: { ...type.displayMd, color: colors.ink },
  metaRow: { flexDirection: "row", gap: spacing.lg },
  metaItem: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  metaText: { ...type.bodySm, color: colors.body },
  photo: { width: "100%", aspectRatio: 4 / 3, borderRadius: radius.xl, backgroundColor: colors.canvasSoft },
  sectionTitle: { ...type.displaySm, color: colors.ink, marginBottom: spacing.sm },
  body: { ...type.bodyMd, color: colors.body },
  mutedLabel: { ...type.bodySmStrong, color: colors.mute, marginBottom: spacing.sm },
  budget: { ...type.displaySm, color: colors.ink },
  personRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  personName: { ...type.bodyMdStrong, color: colors.ink },
  escrowNote: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  escrowText: { ...type.caption, color: colors.mute },
  bidHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  bidPrice: { ...type.displaySm, color: colors.ink },
});
