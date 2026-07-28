import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Trophy } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { User } from "@taskhub/shared";
import { Avatar } from "../components/ui/Avatar";
import { StarRating } from "../components/ui/StarRating";
import { BadgeRow } from "../components/BadgeRow";
import { colors, radius, shadow, spacing, type } from "../theme";

export function LeaderboardScreen({ navigation }: any) {
  const [workers, setWorkers] = useState<User[]>([]);

  useFocusEffect(
    useCallback(() => {
      getClient().getLeaderboard(10).then(setWorkers);
    }, [])
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={workers}
      keyExtractor={(w) => w.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.trophyWrap}>
            <Trophy size={22} color={colors.accent} />
          </View>
          <Text style={styles.heading}>Top-rated workers</Text>
          <Text style={styles.subheading}>Ranked by rating and completed jobs.</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Pressable onPress={() => navigation.navigate("WorkerProfile", { workerId: item.id })} style={styles.row}>
          <View style={[styles.rankWrap, index < 3 && styles.rankWrapTop]}>
            <Text style={[styles.rank, index < 3 && styles.rankTop]}>{index + 1}</Text>
          </View>
          <Avatar src={item.photo} name={item.name} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <StarRating value={item.workerProfile?.rating.avgStars ?? 0} reviewCount={item.workerProfile?.rating.totalReviews} />
          </View>
          {item.workerProfile && <BadgeRow badges={item.workerProfile.badges} />}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { alignItems: "center", marginBottom: spacing.xl },
  trophyWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heading: { ...type.displayMd, color: colors.ink },
  subheading: { ...type.bodySm, color: colors.body, marginTop: spacing.xs, textAlign: "center" },
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
  rankWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rankWrapTop: { backgroundColor: colors.accentSoft },
  rank: { ...type.bodySmStrong, color: colors.mute },
  rankTop: { color: colors.accent, fontWeight: "700" },
  name: { ...type.bodyMdStrong, color: colors.ink },
});
