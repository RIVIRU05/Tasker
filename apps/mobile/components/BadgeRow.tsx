import { View, StyleSheet } from "react-native";
import type { WorkerBadges } from "@taskhub/shared";
import { Pill } from "./ui/Pill";
import { spacing } from "../theme";

const BADGE_LABELS: Record<keyof WorkerBadges, string> = {
  verified: "Verified",
  reliability: "99% on-time",
  trusted: "Trusted",
  pro: "Pro",
};

export function BadgeRow({ badges }: { badges: WorkerBadges }) {
  const active = (Object.keys(BADGE_LABELS) as (keyof WorkerBadges)[]).filter((k) => badges[k]);
  if (active.length === 0) return null;
  return (
    <View style={styles.row}>
      {active.map((key) => (
        <Pill key={key} label={BADGE_LABELS[key]} tone={key === "pro" ? "accent" : "neutral"} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
