import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import type { Task } from "@taskhub/shared";
import { CATEGORY_LABELS, formatMoney } from "@taskhub/shared";
import { CategoryIcon } from "./CategoryIcon";
import { StatusPill } from "./ui/StatusPill";
import { staticMapTileUrl } from "../lib/mapTile";
import { colors, radius, shadow, spacing, type } from "../theme";

export function TaskListItem({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.mapWrap}>
        <Image source={{ uri: staticMapTileUrl(task.location.lat, task.location.lng) }} style={styles.map} />
        <View style={styles.pin} />
        <View style={styles.statusOverlay}>
          <StatusPill status={task.status} />
        </View>
        <View style={styles.cityBadge}>
          <Text style={styles.cityBadgeText} numberOfLines={1}>
            {task.location.city}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.categoryRow}>
          <CategoryIcon category={task.category} size={12} color={colors.mute} />
          <Text style={styles.category}>{CATEGORY_LABELS[task.category]}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.body} />
            <Text style={styles.metaText}>{task.timeline}</Text>
          </View>
        </View>
        <Text style={styles.price}>
          {formatMoney(task.budgetMin, task.location.country)} – {formatMoney(task.budgetMax, task.location.country)}
        </Text>
      </View>
    </Pressable>
  );
}

const MAP_HEIGHT = 110;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    ...shadow.level1,
  },
  mapWrap: { height: MAP_HEIGHT, backgroundColor: colors.canvasSoft },
  map: { width: "100%", height: "100%" },
  pin: {
    position: "absolute",
    top: MAP_HEIGHT / 2 - 6,
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  statusOverlay: { position: "absolute", top: spacing.sm, left: spacing.sm },
  cityBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    maxWidth: "70%",
  },
  cityBadgeText: { ...type.caption, color: colors.ink, fontWeight: "500" },
  body: { padding: spacing.lg },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  category: { ...type.caption, color: colors.mute, textTransform: "uppercase" },
  title: { ...type.bodyLg, color: colors.ink, marginBottom: spacing.sm },
  metaRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.sm },
  metaItem: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  metaText: { ...type.bodySm, color: colors.body },
  price: { ...type.bodyMdStrong, color: colors.ink },
});
