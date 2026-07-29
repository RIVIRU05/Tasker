"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClient } from "@taskhub/data";
import type { UserType } from "@taskhub/shared";
import { useSession } from "@/lib/session";
import { friendlyAuthError } from "@/lib/authErrors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const TYPE_OPTIONS: { value: UserType; label: string; desc: string }[] = [
  { value: "customer", label: "Customer", desc: "I need to hire help for a task" },
  { value: "worker", label: "Worker", desc: "I want to bid on tasks and earn" },
  { value: "both", label: "Both", desc: "I want to post tasks and take jobs" },
];

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "Sydney", password: "" });
  const [userType, setUserType] = useState<UserType>("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudentEmail = /\.(ac\.lk|edu\.au)$/i.test(form.email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await getClient().signUp({
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        userType,
        password: form.password,
      });
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
        <h1 className="text-display-lg font-display text-ink text-center">Create your account</h1>
        <p className="text-body-md text-body text-center mt-sm">Free to join, post your first task in minutes.</p>

        <Card variant="elevated" className="mt-2xl">
          <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
            <div>
              <span className="block text-body-sm-strong text-ink mb-sm">I am a…</span>
              <div className="grid grid-cols-3 gap-sm">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setUserType(opt.value)}
                    className={`rounded-md px-md py-md text-body-sm-strong text-center transition-colors ${
                      userType === opt.value ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-ink hover:bg-surface-pressed"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-caption text-mute mt-sm">{TYPE_OPTIONS.find((o) => o.value === userType)?.desc}</p>
            </div>

            <Input
              id="name"
              label="Full name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              hint={isStudentEmail ? "Student email detected, you'll get student pricing automatically." : "Use an .edu.au email to unlock student pricing."}
            />
            <Input
              id="phone"
              label="Phone"
              required
              placeholder="+61 412 345 678"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              id="location"
              label="Location"
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            {error && <p className="text-body-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="justify-center" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card>

        <p className="text-body-sm text-body text-center mt-lg">
          Already have an account?{" "}
          <Link href="/login" className="text-ink font-text font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
