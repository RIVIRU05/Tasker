import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { getClient } from "@taskhub/data";
import type { CountryCode, TaskCategory, TaskTimeline } from "@taskhub/shared";
import { CATEGORY_LABELS, COUNTRY_CURRENCY, COUNTRY_LABELS } from "@taskhub/shared";
import { useSession } from "../lib/session";
import { useCountry } from "../lib/country";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { CategoryIcon } from "../components/CategoryIcon";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { searchLocations } from "../lib/geocode";
import { colors, radius, spacing, type } from "../theme";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];
const COUNTRIES: CountryCode[] = ["LK", "AU"];
const COUNTRY_FLAGS: Record<CountryCode, string> = { LK: "🇱🇰", AU: "🇦🇺" };
const STEPS = ["Details", "Budget", "Review"];

export function PostTaskScreen({ navigation }: any) {
  const { user, loading } = useSession();
  const { country: browsingCountry } = useCountry();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "plumbing" as TaskCategory,
    city: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "flexible" as TaskTimeline,
    district: undefined as string | undefined,
    country: browsingCountry as CountryCode,
    lat: null as number | null,
    lng: null as number | null,
  });

  if (!loading && !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Log in to post a task</Text>
        <Button label="Log in" onPress={() => navigation.navigate("Login")} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const canContinue =
    step === 0
      ? form.title.trim().length > 5 && form.description.trim().length > 10 && form.city.trim().length > 0
      : step === 1
      ? Number(form.budgetMin) > 0 && Number(form.budgetMax) >= Number(form.budgetMin)
      : true;

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    let { lat, lng, district } = form;
    if (lat == null || lng == null) {
      const results = await searchLocations(form.city, form.country).catch(() => []);
      if (results[0]) {
        lat = results[0].lat;
        lng = results[0].lng;
        district = results[0].district;
      }
    }
    const task = await getClient().createTask({
      title: form.title,
      description: form.description,
      category: form.category,
      photos: [],
      location: {
        address: form.city,
        city: form.city,
        district,
        country: form.country,
        lat: lat ?? (form.country === "AU" ? -33.8688 : 6.9271),
        lng: lng ?? (form.country === "AU" ? 151.2093 : 79.8612),
      },
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      timeline: form.timeline,
      customerId: user.id,
    });
    setSubmitting(false);
    setStep(0);
    setForm({
      title: "",
      description: "",
      category: "plumbing",
      city: "",
      budgetMin: "",
      budgetMax: "",
      timeline: "flexible",
      district: undefined,
      country: browsingCountry,
      lat: null,
      lng: null,
    });
    navigation.navigate("TaskDetail", { taskId: task.id });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Post a task</Text>

      <View style={styles.stepsRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Card variant="elevated" style={{ gap: spacing.lg }}>
        {step === 0 && (
          <>
            <Text style={styles.label}>Country</Text>
            <View style={styles.categoryGrid}>
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setForm((f) => ({ ...f, country: c, city: "", district: undefined, lat: null, lng: null }))}
                  style={[styles.categoryOption, form.country === c && styles.categoryOptionActive]}
                >
                  <Text style={[styles.categoryText, form.country === c && { color: colors.onDark }]}>
                    {COUNTRY_FLAGS[c]} {COUNTRY_LABELS[c]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setForm((f) => ({ ...f, category: cat }))}
                  style={[styles.categoryOption, form.category === cat && styles.categoryOptionActive]}
                >
                  <CategoryIcon category={cat} size={14} color={form.category === cat ? colors.onDark : colors.ink} />
                  <Text style={[styles.categoryText, form.category === cat && { color: colors.onDark }]}>{CATEGORY_LABELS[cat]}</Text>
                </Pressable>
              ))}
            </View>
            <Input label="Task title" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Fix leaking kitchen tap" />
            <Textarea label="Description" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Be specific…" />
            <LocationAutocomplete
              label="City / area"
              value={form.city}
              country={form.country}
              onChangeText={(city) => setForm((f) => ({ ...f, city, district: undefined, lat: null, lng: null }))}
              onSelect={(s) => setForm((f) => ({ ...f, city: s.city, district: s.district, lat: s.lat, lng: s.lng }))}
              placeholder={form.country === "AU" ? "e.g. Parramatta, Sydney" : "e.g. Nugegoda, Colombo"}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Input label={`Budget min (${COUNTRY_CURRENCY[form.country]})`} keyboardType="numeric" value={form.budgetMin} onChangeText={(v) => setForm((f) => ({ ...f, budgetMin: v }))} />
            <Input label={`Budget max (${COUNTRY_CURRENCY[form.country]})`} keyboardType="numeric" value={form.budgetMax} onChangeText={(v) => setForm((f) => ({ ...f, budgetMax: v }))} />
            <Text style={styles.label}>Timeline</Text>
            <View style={styles.categoryGrid}>
              {(["urgent", "flexible", "scheduled"] as TaskTimeline[]).map((tl) => (
                <Pressable
                  key={tl}
                  onPress={() => setForm((f) => ({ ...f, timeline: tl }))}
                  style={[styles.categoryOption, form.timeline === tl && styles.categoryOptionActive]}
                >
                  <Text style={[styles.categoryText, form.timeline === tl && { color: colors.onDark }]}>{tl}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.reviewTitle}>{form.title || "Untitled task"}</Text>
            <Text style={styles.body}>{form.description}</Text>
            <Text style={styles.body}>Location: {form.city || "—"}, {COUNTRY_LABELS[form.country]}</Text>
            <Text style={styles.body}>Timeline: {form.timeline}</Text>
            <Text style={styles.body}>
              Budget: {COUNTRY_CURRENCY[form.country]} {form.budgetMin || 0} – {form.budgetMax || 0}
            </Text>
          </>
        )}

        <View style={styles.navRow}>
          {step > 0 ? <Button label="Back" variant="subtle" onPress={() => setStep((s) => s - 1)} /> : <View />}
          {step < STEPS.length - 1 ? (
            <Button label="Continue" onPress={() => setStep((s) => s + 1)} disabled={!canContinue} />
          ) : (
            <Button label={submitting ? "Posting…" : "Post task"} onPress={handleSubmit} loading={submitting} />
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas, padding: spacing.xxxl },
  heading: { ...type.displayMd, color: colors.ink, textAlign: "center" },
  stepsRow: { flexDirection: "row", justifyContent: "center", gap: spacing.xl, marginVertical: spacing.lg },
  stepItem: { alignItems: "center", gap: spacing.xxs },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.canvasSoft, alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: colors.accent },
  stepNum: { ...type.bodySmStrong, color: colors.mute },
  stepNumActive: { color: colors.onDark },
  stepLabel: { ...type.caption, color: colors.mute },
  label: { ...type.bodySmStrong, color: colors.ink },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryOption: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.canvasSoft, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  categoryOptionActive: { backgroundColor: colors.accent },
  categoryText: { ...type.bodySmStrong, color: colors.ink, textTransform: "capitalize" },
  reviewTitle: { ...type.displaySm, color: colors.ink },
  body: { ...type.bodyMd, color: colors.body },
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
});
