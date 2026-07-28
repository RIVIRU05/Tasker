import { useCallback, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Clock3, CheckCircle2 } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { Rating, User } from "@taskhub/shared";
import { CATEGORY_LABELS } from "@taskhub/shared";
import { Card } from "../components/ui/Card";
import { StarRating } from "../components/ui/StarRating";
import { Avatar } from "../components/ui/Avatar";
import { BadgeRow } from "../components/BadgeRow";
import { Pill } from "../components/ui/Pill";
import { CategoryIcon } from "../components/CategoryIcon";
import { colors, radius, spacing, type } from "../theme";

export function WorkerProfileScreen({ route }: any) {
  const { workerId } = route.params;
  const [worker, setWorker] = useState<User | null | undefined>(undefined);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useFocusEffect(
    useCallback(() => {
      const client = getClient();
      client.getUser(workerId).then((found) => {
        setWorker(found ?? null);
        if (found) client.getRatingsForUser(found.id).then(setRatings);
      });
    }, [workerId])
  );

  if (!worker || !worker.workerProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>{worker === undefined ? "Loading…" : "Worker not found"}</Text>
      </View>
    );
  }

  const profile = worker.workerProfile;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Avatar src={worker.photo} name={worker.name} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{worker.name}</Text>
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.body} />
            <Text style={styles.metaText}>{worker.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Clock3 size={12} color={colors.body} />
            <Text style={styles.metaText}>Responds in ~{profile.responseTimeMinutes} min</Text>
          </View>
        </View>
      </View>

      <BadgeRow badges={profile.badges} />

      <Card>
        <StarRating value={profile.rating.avgStars} reviewCount={profile.rating.totalReviews} size={18} />
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rating.completedJobs}</Text>
            <Text style={styles.metaText}>Jobs completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(profile.completionRate * 100)}%</Text>
            <Text style={styles.metaText}>Completion rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.yearsExperience}</Text>
            <Text style={styles.metaText}>Years experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{worker.isStudent ? "15%" : "20%"}</Text>
            <Text style={styles.metaText}>Platform fee</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{profile.bio || "This worker hasn't added a bio yet."}</Text>
        <View style={styles.skillsRow}>
          {profile.skills.map((skill) => (
            <Pill key={skill} label={CATEGORY_LABELS[skill]} />
          ))}
        </View>
      </Card>

      {profile.portfolio.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.portfolioGrid}>
            {profile.portfolio.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.portfolioImage} />
            ))}
          </View>
        </View>
      )}

      {profile.paymentMethods.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Accepted payment</Text>
          {profile.paymentMethods.map((pm) => (
            <View key={pm.label} style={styles.paymentRow}>
              <CheckCircle2 size={14} color={colors.success} />
              <Text style={styles.body}>{pm.label}</Text>
            </View>
          ))}
        </Card>
      )}

      <View>
        <Text style={styles.sectionTitle}>Reviews ({ratings.length})</Text>
        {ratings.length === 0 && <Text style={styles.metaText}>No reviews yet.</Text>}
        {ratings.map((rating) => (
          <Card key={rating.id} style={{ marginTop: spacing.md }}>
            <StarRating value={rating.stars} showValue={false} />
            <Text style={[styles.body, { marginTop: spacing.sm }]}>{rating.review}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  name: { ...type.displaySm, color: colors.ink },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xxs },
  metaText: { ...type.bodySm, color: colors.body },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  statItem: { width: "40%" },
  statValue: { ...type.displaySm, color: colors.ink },
  sectionTitle: { ...type.displaySm, color: colors.ink, marginBottom: spacing.sm },
  body: { ...type.bodyMd, color: colors.body },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  portfolioImage: { width: "48%", aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.canvasSoft },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
});
