"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClient } from "@taskhub/data";
import { useSession } from "@/lib/session";
import { friendlyAuthError } from "@/lib/authErrors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

const DEMO_ACCOUNTS = [
  { email: "nadeesha.p@gmail.com", label: "Nadeesha (customer)" },
  { email: "sunil.plumbing@gmail.com", label: "Sunil (worker, plumber)" },
  { email: "chamodi.clean@gmail.com", label: "Chamodi (student worker)" },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail: string, loginPassword?: string) {
    setLoading(true);
    setError(null);
    try {
      await getClient().login(loginEmail, loginPassword ?? password);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="max-w-md mx-auto">
        <h1 className="text-display-lg font-display text-ink text-center">Welcome back</h1>
        <p className="text-body-md text-body text-center mt-sm">Log in to manage your tasks and bids.</p>

        <Card variant="elevated" className="mt-2xl">
          <form
            className="flex flex-col gap-lg"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email);
            }}
          >
            <Input
              id="email"
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={USE_MOCK ? "This is a prototype, any password works for demo accounts." : undefined}
            />
            {error && <p className="text-body-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="justify-center" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </Card>

        {USE_MOCK && (
          <Card variant="soft" className="mt-lg">
            <p className="text-body-sm-strong text-ink mb-md">Or try a demo account</p>
            <div className="flex flex-col gap-sm">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleLogin(acc.email, "demo")}
                  disabled={loading}
                  className="text-left text-body-sm rounded-md bg-canvas px-lg py-md hover:bg-canvas-softer transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </Card>
        )}

        <p className="text-body-sm text-body text-center mt-lg">
          New to Tasker?{" "}
          <Link href="/signup" className="text-ink font-text font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
