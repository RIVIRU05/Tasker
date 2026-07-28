import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getClient } from "@taskhub/data";
import type { Bid, Task } from "@taskhub/shared";
import { CATEGORY_LABELS, formatLKR } from "@taskhub/shared";
import { useSession } from "../lib/session";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusPill } from "../components/ui/StatusPill";
import { StarRating } from "../components/ui/StarRating";
import { Avatar } from "../components/ui/Avatar";
import { colors, radius, shadow, spacing, type } from "../theme";

export function DashboardScreen({ navigation }: any) {
  const { user, loading, logout } = useSession();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<(Bid & { task?: Task })[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const client = getClient();
    const allTasks = await client.getTasks();
    setMyTasks(allTasks.filter((t) => t.customerId === user.id));
    if (user.workerProfile) {
      setAssignedJobs(allTasks.filter((t) => t.workerId === user.id));
      const bids = await client.getBidsByWorker(user.id);
      const withTasks = await Promise.all(bids.map(async (b) => ({ ...b, task: await client.getTask(b.taskId) })));
      setMyBids(withTasks);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!loading && !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Log in to see your dashboard</Text>
        <Button label="Log in" onPress={() => navigation.navigate("Login")} style={{ marginTop: spacing.lg }} />
        <Pressable onPress={() => navigation.navigate("Signup")} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>Or create an account</Text>
        </Pressable>
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Avatar src={user.photo} name={user.name} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Hi, {user.name.split(" ")[0]}</Text>
          <Text style={styles.subheading}>{user.email}</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <Button label="Post a task" variant="subtle" onPress={() => navigation.navigate("Post")} style={{ flex: 1 }} />
        <Button label="Log out" variant="secondary" onPress={logout} style={{ flex: 1 }} />
      </View>

      <Text style={styles.sectionTitle}>My posted tasks ({myTasks.length})</Text>
      {myTasks.length === 0 && (
        <Card variant="soft">
          <Text style={styles.body}>You haven&apos;t posted any tasks yet.</Text>
        </Card>
      )}
      {myTasks.map((task) => (
        <Pressable key={task.id} onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.metaText}>
              {CATEGORY_LABELS[task.category]} · {formatLKR(task.budgetMin)}–{formatLKR(task.budgetMax)}
            </Text>
          </View>
          <StatusPill status={task.status} />
        </Pressable>
      ))}

      {user.workerProfile && (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active jobs ({assignedJobs.length})</Text>
            <StarRating value={user.workerProfile.rating.avgStars} reviewCount={user.workerProfile.rating.totalReviews} />
          </View>
          {assignedJobs.length === 0 && (
            <Card variant="soft">
              <Text style={styles.body}>No active jobs yet — browse open tasks to bid.</Text>
            </Card>
          )}
          {assignedJobs.map((task) => (
            <Pressable key={task.id} onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.metaText}>{formatLKR(task.paymentAmount)} agreed</Text>
              </View>
              <StatusPill status={task.status} />
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>My bids ({myBids.length})</Text>
          {myBids.length === 0 && (
            <Card variant="soft">
              <Text style={styles.body}>You haven&apos;t submitted any bids yet.</Text>
            </Card>
          )}
          {myBids.map((bid) => (
            <Pressable key={bid.id} onPress={() => navigation.navigate("TaskDetail", { taskId: bid.taskId })} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {bid.task?.title ?? "Task"}
                </Text>
                <Text style={styles.metaText}>Your bid: {formatLKR(bid.offeredPrice)}</Text>
              </View>
              <Text style={[styles.bidStatus, bid.status === "accepted" && { color: colors.success }, bid.status === "rejected" && { color: colors.danger }]}>
                {bid.status}
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas, padding: spacing.xxxl },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  heading: { ...type.displaySm, color: colors.ink },
  subheading: { ...type.bodySm, color: colors.body },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  sectionTitle: { ...type.displaySm, color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xl },
  body: { ...type.bodyMd, color: colors.body },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.level1,
  },
  rowTitle: { ...type.bodyMdStrong, color: colors.ink },
  metaText: { ...type.bodySm, color: colors.body, marginTop: spacing.xxs },
  bidStatus: { ...type.bodySmStrong, color: colors.ink, textTransform: "capitalize" },
  link: { ...type.bodySm, color: colors.primary, fontWeight: "600" },
});
