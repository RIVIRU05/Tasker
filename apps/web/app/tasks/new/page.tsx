"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClient } from "@taskhub/data";
import type { TaskCategory, TaskTimeline } from "@taskhub/shared";
import { CATEGORY_LABELS } from "@taskhub/shared";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { CategoryIcon } from "@/components/CategoryIcon";
import { PhotoUploadInput } from "@/components/PhotoUploadInput";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import type { LocationSuggestion } from "@taskhub/shared";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];
const STEPS = ["Details", "Budget & timeline", "Photos", "Review"];

export default function NewTaskPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadId] = useState(() => Math.random().toString(36).slice(2, 10));

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "plumbing" as TaskCategory,
    address: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "flexible" as TaskTimeline,
    scheduledDate: "",
    photos: [] as string[],
    lat: null as number | null,
    lng: null as number | null,
  });

  if (!loading && !user) {
    return (
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <h1 className="text-display-lg font-display text-ink">Log in to post a task</h1>
        <p className="text-body-md text-body mt-sm">You need an account to post a task and receive bids.</p>
        <Button href="/login" variant="primary" className="mt-lg">
          Log in
        </Button>
      </div>
    );
  }

  const canContinue =
    step === 0
      ? form.title.trim().length > 5 && form.description.trim().length > 20 && form.city.trim().length > 0
      : step === 1
      ? Number(form.budgetMin) > 0 && Number(form.budgetMax) >= Number(form.budgetMin)
      : true;

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    let { lat, lng } = form;
    if (lat == null || lng == null) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(form.city)}`);
        const data = await res.json();
        const top: LocationSuggestion | undefined = data.results?.[0];
        if (top) {
          lat = top.lat;
          lng = top.lng;
        }
      } catch {
        // handled by the Colombo fallback below
      }
    }
    const task = await getClient().createTask({
      title: form.title,
      description: form.description,
      category: form.category,
      photos: form.photos,
      location: { address: form.address || form.city, city: form.city, lat: lat ?? 6.9271, lng: lng ?? 79.8612 },
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      timeline: form.timeline,
      scheduledDate: form.timeline === "scheduled" ? form.scheduledDate : undefined,
      customerId: user.id,
    });
    setSubmitting(false);
    router.push(`/tasks/${task.id}`);
  }

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display-lg font-display text-ink text-center">Post a task</h1>

        <div className="flex items-center justify-center gap-sm mt-2xl mb-2xl">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-sm">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-body-sm-strong ${
                  i <= step ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-mute"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-body-sm-strong hidden sm:inline ${i <= step ? "text-ink" : "text-mute"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="w-6 h-px bg-canvas-soft mx-sm" />}
            </div>
          ))}
        </div>

        <Card variant="elevated">
          {step === 0 && (
            <div className="flex flex-col gap-lg">
              <div>
                <span className="block text-body-sm-strong text-ink mb-sm">Category</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={`flex items-center gap-sm rounded-md px-md py-md text-body-sm-strong transition-colors ${
                        form.category === cat ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-ink hover:bg-surface-pressed"
                      }`}
                    >
                      <CategoryIcon category={cat} size={16} />
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                id="title"
                label="Task title"
                required
                placeholder="e.g. Fix leaking kitchen tap"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <Textarea
                id="description"
                label="Description"
                required
                placeholder="Be specific — what needs doing, any access details, materials on hand…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                hint="At least 20 characters. Workers bid better with more detail."
              />
              <div className="grid sm:grid-cols-2 gap-lg">
                <LocationAutocomplete
                  label="City / area"
                  required
                  placeholder="e.g. Nugegoda, Colombo"
                  value={form.city}
                  onChange={(city) => setForm((f) => ({ ...f, city, lat: null, lng: null }))}
                  onSelect={(s) => setForm((f) => ({ ...f, city: s.city, lat: s.lat, lng: s.lng }))}
                />
                <Input
                  id="address"
                  label="Address (optional)"
                  placeholder="Street address, house number, landmark…"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-lg">
              <div className="grid sm:grid-cols-2 gap-lg">
                <Input
                  id="budgetMin"
                  type="number"
                  label="Budget min (LKR)"
                  required
                  min={0}
                  value={form.budgetMin}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
                />
                <Input
                  id="budgetMax"
                  type="number"
                  label="Budget max (LKR)"
                  required
                  min={0}
                  value={form.budgetMax}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
                />
              </div>
              <Select
                id="timeline"
                label="Timeline"
                value={form.timeline}
                onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value as TaskTimeline }))}
              >
                <option value="urgent">Urgent — ASAP</option>
                <option value="flexible">Flexible</option>
                <option value="scheduled">Scheduled date</option>
              </Select>
              {form.timeline === "scheduled" && (
                <Input
                  id="scheduledDate"
                  type="date"
                  label="Date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-lg">
              <PhotoUploadInput
                label="Photos (optional)"
                pathPrefix={`task-photos/${uploadId}`}
                value={form.photos}
                onChange={(photos) => setForm((f) => ({ ...f, photos }))}
                multiple
                hint="Help workers understand the job at a glance."
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-lg">
              <div className="flex items-center gap-sm text-body-sm-strong text-ink">
                <CategoryIcon category={form.category} size={16} />
                {CATEGORY_LABELS[form.category]}
              </div>
              <div>
                <p className="text-display-sm font-display text-ink">{form.title || "Untitled task"}</p>
                <p className="text-body-md text-body mt-sm whitespace-pre-line">{form.description}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-lg text-body-sm text-body">
                <p>
                  <span className="text-mute">Location:</span> {form.city || "—"}
                </p>
                <p>
                  <span className="text-mute">Timeline:</span> {form.timeline}
                  {form.timeline === "scheduled" && form.scheduledDate ? ` (${form.scheduledDate})` : ""}
                </p>
                <p>
                  <span className="text-mute">Budget:</span> LKR {form.budgetMin || 0} – {form.budgetMax || 0}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2xl pt-2xl border-t border-black/[0.06]">
            <Button
              variant="subtle"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={step === 0 ? "invisible" : ""}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? "Posting…" : "Post task"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
