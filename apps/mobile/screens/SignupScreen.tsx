import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { getClient } from "@taskhub/data";
import type { UserType } from "@taskhub/shared";
import { useSession } from "../lib/session";
import { friendlyAuthError } from "../lib/authErrors";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { colors, radius, spacing, type } from "../theme";

const TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "worker", label: "Worker" },
  { value: "both", label: "Both" },
];

export function SignupScreen({ navigation }: any) {
  const { refresh } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "Colombo", password: "" });
  const [userType, setUserType] = useState<UserType>("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await getClient().signUp({ ...form, userType, password: form.password || "demo123" });
      await refresh();
      navigation.goBack();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.subheading}>Free to join, post your first task in minutes.</Text>

      <Card variant="elevated" style={{ marginTop: spacing.xl, gap: spacing.lg }}>
        <View>
          <Text style={styles.label}>I am a…</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setUserType(opt.value)}
                style={[styles.typeOption, userType === opt.value && styles.typeOptionActive]}
              >
                <Text style={[styles.typeLabel, userType === opt.value && styles.typeLabelActive]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Input label="Full name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          placeholder="you@example.com"
          hint="Use a .ac.lk email to unlock student pricing"
        />
        <Input
          label="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          placeholder="+94 77 123 4567"
        />
        <Input label="Location" value={form.location} onChangeText={(v) => setForm((f) => ({ ...f, location: v }))} />
        <Input
          label="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
          placeholder="••••••••"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label={loading ? "Creating account…" : "Create account"} onPress={handleSubmit} loading={loading} />
      </Card>

      <Pressable onPress={() => navigation.navigate("Login")} style={{ marginTop: spacing.lg, alignItems: "center" }}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  heading: { ...type.displayMd, color: colors.ink, textAlign: "center", marginTop: spacing.lg },
  subheading: { ...type.bodyMd, color: colors.body, textAlign: "center", marginTop: spacing.xs },
  label: { ...type.bodySmStrong, color: colors.ink, marginBottom: spacing.sm },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeOption: { flex: 1, backgroundColor: colors.canvasSoft, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: "center" },
  typeOptionActive: { backgroundColor: colors.primary },
  typeLabel: { ...type.bodySmStrong, color: colors.ink },
  typeLabelActive: { color: colors.onDark },
  error: { ...type.bodySm, color: colors.danger },
  link: { ...type.bodySm, color: colors.primary, fontWeight: "600" },
});
