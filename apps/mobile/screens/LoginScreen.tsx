import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { getClient } from "@taskhub/data";
import { useSession } from "../lib/session";
import { friendlyAuthError } from "../lib/authErrors";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { colors, spacing, type } from "../theme";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== "false";

const DEMO_ACCOUNTS = [
  { email: "nadeesha.p@gmail.com", label: "Nadeesha (customer)" },
  { email: "sunil.plumbing@gmail.com", label: "Sunil (worker, plumber)" },
  { email: "chamodi.clean@gmail.com", label: "Chamodi (student worker)" },
];

export function LoginScreen({ navigation }: any) {
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail: string) {
    setLoading(true);
    setError(null);
    try {
      await getClient().login(loginEmail, password || "demo");
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
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subheading}>Log in to manage your tasks and bids.</Text>

      <Card variant="elevated" style={{ marginTop: spacing.xl, gap: spacing.lg }}>
        <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label={loading ? "Logging in…" : "Log in"} onPress={() => handleLogin(email)} loading={loading} />
      </Card>

      {USE_MOCK && (
        <Card variant="soft" style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Text style={styles.demoLabel}>Or try a demo account</Text>
          {DEMO_ACCOUNTS.map((acc) => (
            <Pressable key={acc.email} onPress={() => handleLogin(acc.email)} style={styles.demoRow}>
              <Text style={styles.demoText}>{acc.label}</Text>
            </Pressable>
          ))}
        </Card>
      )}

      <Pressable onPress={() => navigation.navigate("Signup")} style={{ marginTop: spacing.lg, alignItems: "center" }}>
        <Text style={styles.link}>New to Tasker? Sign up</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  heading: { ...type.displayMd, color: colors.ink, textAlign: "center", marginTop: spacing.lg },
  subheading: { ...type.bodyMd, color: colors.body, textAlign: "center", marginTop: spacing.xs },
  error: { ...type.bodySm, color: colors.danger },
  demoLabel: { ...type.bodySmStrong, color: colors.ink },
  demoRow: { backgroundColor: colors.canvas, borderRadius: 8, padding: spacing.md },
  demoText: { ...type.bodySm, color: colors.ink },
  link: { ...type.bodySm, color: colors.primary, fontWeight: "600" },
});
