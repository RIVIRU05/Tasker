import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import { Textarea } from "./ui/Input";
import { Button } from "./ui/Button";
import { colors, spacing, type } from "../theme";

export function RatingForm({
  taskId,
  ratedById,
  ratedUserId,
  ratingType,
  onSubmitted,
}: {
  taskId: string;
  ratedById: string;
  ratedUserId: string;
  ratingType: "worker" | "customer";
  onSubmitted?: () => void;
}) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await getClient().submitRating({
      taskId,
      ratedById,
      ratedUserId,
      ratingType,
      stars,
      review,
      categories: { communication: stars, professionalism: stars, quality: stars, timeliness: stars },
    });
    setSubmitting(false);
    setDone(true);
    onSubmitted?.();
  }

  if (done) return <Text style={styles.done}>Thanks for the feedback, your review is posted.</Text>;

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={styles.label}>Your rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)}>
            <Star size={26} color={colors.accent} fill={n <= stars ? colors.accent : "transparent"} />
          </Pressable>
        ))}
      </View>
      <Textarea placeholder="How did it go?" value={review} onChangeText={setReview} />
      <Button label={submitting ? "Submitting…" : "Submit review"} onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.bodySmStrong, color: colors.ink },
  starsRow: { flexDirection: "row", gap: spacing.xs },
  done: { ...type.bodyMd, color: colors.ink },
});
