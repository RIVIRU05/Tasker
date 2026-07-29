import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowRight, ChevronRight, ShieldCheck } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { Task, TaskCategory } from "@taskhub/shared";
import { CATEGORY_LABELS } from "@taskhub/shared";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CategoryIcon } from "../components/CategoryIcon";
import { TaskListItem } from "../components/TaskListItem";
import { useCountry } from "../lib/country";
import { colors, radius, spacing, type } from "../theme";

const CATEGORIES: TaskCategory[] = ["plumbing", "electrical", "painting", "moving", "cleaning", "carpentry", "welding", "gardening"];

export function HomeScreen({ navigation }: any) {
  const { country } = useCountry();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getClient()
        .getTasks({ status: "open", country })
        .then(setTasks)
        .catch(() => setError(true));
    }, [country])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Get it done by trusted local pros</Text>
      <Text style={styles.subheading}>Post a task, get bids from verified workers across Colombo and Kandy.</Text>

      <View style={styles.ctaRow}>
        <Button
          label="Post a task"
          icon={<ArrowRight size={16} color={colors.onDark} />}
          onPress={() => navigation.navigate("Post")}
          style={{ flex: 1 }}
        />
        <Button label="Browse" variant="secondary" onPress={() => navigation.navigate("Tasks")} style={{ flex: 1 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ gap: spacing.sm }}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => navigation.navigate("Tasks", { category: cat })}
            style={styles.chip}
          >
            <CategoryIcon category={cat} size={13} color={colors.ink} />
            <Text style={styles.chipText}>{CATEGORY_LABELS[cat]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card variant="onDark" style={styles.trustCard}>
        <ShieldCheck size={22} color={colors.accent} />
        <Text style={styles.trustTitle}>Every job is protected</Text>
        <Text style={styles.trustBody}>
          Payments sit in escrow until you approve the work. Disputes are resolved within 3–5 days.
        </Text>
      </Card>

      <Pressable onPress={() => navigation.navigate("Leaderboard")} style={styles.linkRow}>
        <Text style={styles.link}>Top-rated workers</Text>
        <ChevronRight size={16} color={colors.primary} />
      </Pressable>

      <Text style={styles.sectionTitle}>Open tasks near you</Text>

      {!tasks && !error && <Text style={styles.bodyText}>Loading…</Text>}
      {error && <Text style={styles.bodyText}>Couldn&apos;t load tasks right now.</Text>}
      {tasks && tasks.length === 0 && <Text style={styles.bodyText}>No open tasks yet, be the first to post one.</Text>}

      {tasks?.slice(0, 8).map((task) => (
        <TaskListItem key={task.id} task={task} onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })} />
      ))}

      <Text style={styles.attribution}>Map data © OpenStreetMap contributors</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  heading: { ...type.displayLg, color: colors.ink, marginTop: spacing.sm },
  subheading: { ...type.bodyMd, color: colors.body, marginTop: spacing.sm },
  ctaRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  chipsRow: { marginTop: spacing.xl },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipText: { ...type.bodySmStrong, color: colors.ink },
  trustCard: { marginTop: spacing.xl, gap: spacing.sm },
  trustTitle: { ...type.displaySm, color: colors.onDark, marginTop: spacing.xs },
  trustBody: { ...type.bodySm, color: "rgba(255,255,255,0.75)" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginTop: spacing.xl },
  link: { ...type.bodySmStrong, color: colors.primary },
  sectionTitle: { ...type.displaySm, color: colors.ink, marginTop: spacing.xxxl, marginBottom: spacing.lg },
  bodyText: { ...type.bodyMd, color: colors.body },
  attribution: { ...type.caption, color: colors.mute, textAlign: "center", marginTop: spacing.lg },
});
