import { ShieldCheck, Lock, Clock3, Star, MessageCircle, Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HowItWorksPage() {
  return (
    <div>
      <section className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <h1 className="text-display-xl font-display text-ink">How Tasker works</h1>
        <p className="text-body-lg text-body mt-lg max-w-lg mx-auto">
          From posting a task to getting paid, here&apos;s exactly what happens at each step.
        </p>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <div className="grid lg:grid-cols-2 gap-2xl">
          <Card variant="content" className="border border-black/[0.06]">
            <h2 className="text-display-md font-display text-ink mb-lg">For customers</h2>
            <ol className="flex flex-col gap-lg">
              {[
                ["Post your task", "Title, description, photos, budget and location. Takes under 2 minutes."],
                ["Compare bids", "Workers bid with a price and message. Sort by rating or price."],
                ["Accept & pay into escrow", "Your payment is held safely until the work is done."],
                ["Approve completion", "Review before/after photos, then release payment or raise a dispute."],
                ["Rate the worker", "Help the next customer choose well."],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-lg">
                  <span className="w-7 h-7 rounded-full bg-primary-600 text-on-dark flex items-center justify-center text-body-sm-strong shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-body-md-strong text-ink">{title}</p>
                    <p className="text-body-sm text-body mt-xs">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button href="/tasks/new" variant="primary" className="mt-2xl">
              Post a task
            </Button>
          </Card>

          <Card variant="content" className="border border-black/[0.06]">
            <h2 className="text-display-md font-display text-ink mb-lg">For workers</h2>
            <ol className="flex flex-col gap-lg">
              {[
                ["Build your profile", "Add skills, experience, portfolio photos and payment details."],
                ["Browse open tasks", "Filter by category and location near you."],
                ["Submit a bid", "Offer your price and a short message explaining your approach."],
                ["Do the job, document it", "Before/after photos protect both sides if anything's disputed."],
                ["Get paid", "Funds release from escrow once the customer approves. 80-85% is yours."],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-lg">
                  <span className="w-7 h-7 rounded-full bg-primary-600 text-on-dark flex items-center justify-center text-body-sm-strong shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-body-md-strong text-ink">{title}</p>
                    <p className="text-body-sm text-body mt-xs">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button href="/signup" variant="primary" className="mt-2xl">
              Start earning
            </Button>
          </Card>
        </div>
      </section>

      <section id="trust" className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl scroll-mt-24">
        <Card variant="on-dark">
          <div className="flex items-start gap-lg">
            <ShieldCheck size={28} className="shrink-0" />
            <div>
              <h2 className="text-display-md font-display text-on-dark">Trust & verification</h2>
              <p className="text-body-md text-white/70 mt-sm max-w-2xl">
                New workers need 5 completed jobs before they get high visibility. Ratings below
                3.5★ trigger automatic removal; 3+ no-shows means suspension. Verified, Reliability,
                Trusted and Pro badges surface a track record at a glance.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section id="payments" className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl scroll-mt-24">
        <div className="grid sm:grid-cols-3 gap-2xl">
          <Card variant="soft">
            <Lock size={20} className="mb-lg" />
            <h3 className="text-display-sm font-display text-ink">Escrow payments</h3>
            <p className="text-body-sm text-body mt-sm">
              Money moves to escrow the moment you accept a bid. The worker only gets paid once
              you approve the finished job, or automatically after 48 hours.
            </p>
          </Card>
          <Card variant="soft">
            <Camera size={20} className="mb-lg" />
            <h3 className="text-display-sm font-display text-ink">Photo documentation</h3>
            <p className="text-body-sm text-body mt-sm">
              Before/after photos are attached to every job, giving both sides evidence if a
              dispute is raised.
            </p>
          </Card>
          <Card variant="soft">
            <MessageCircle size={20} className="mb-lg" />
            <h3 className="text-display-sm font-display text-ink">Everything in chat</h3>
            <p className="text-body-sm text-body mt-sm">
              Scope changes, price revisions and confirmations happen in-app, so there&apos;s always
              a record.
            </p>
          </Card>
        </div>
      </section>

      <section id="disputes" className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl scroll-mt-24">
        <Card variant="content" className="border border-black/[0.06]">
          <div className="flex items-center gap-md mb-lg">
            <Clock3 size={22} />
            <h2 className="text-display-md font-display text-ink">Dispute resolution in 3–5 days</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              ["Message first", "Most issues resolve with a message the same day."],
              ["48-hour grace period", "The worker gets 2 days to fix the issue directly."],
              ["Formal dispute", "Both sides submit photos and a written account."],
              ["Tasker decides", "We review evidence and issue a refund, partial, or full payment."],
            ].map(([title, desc]) => (
              <div key={title}>
                <p className="text-body-md-strong text-ink">{title}</p>
                <p className="text-body-sm text-body mt-xs">{desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="max-w-container mx-auto px-lg lg:px-3xl pb-3xl">
        <Card variant="soft" className="flex items-center gap-lg">
          <Star size={22} className="shrink-0" />
          <p className="text-body-md text-ink">
            Verify with a <strong>.ac.lk</strong> email for student pricing: a 10% discount as a
            customer, or a reduced 9% commission as a worker.
          </p>
        </Card>
      </section>
    </div>
  );
}
