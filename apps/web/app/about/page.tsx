import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="max-w-2xl">
        <h1 className="text-display-xl font-display text-ink">About Tasker</h1>
        <p className="text-body-lg text-body mt-lg">
          Tasker connects Sri Lankan homeowners and businesses with skilled local workers —
          plumbers, electricians, painters, movers, welders and more. We started in Colombo with
          one goal: make it as easy to book a trusted plumber as it is to book a ride.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-2xl mt-3xl">
        <Card variant="soft">
          <p className="text-display-md font-display text-ink">21M</p>
          <p className="text-body-sm text-body mt-xs">People across Sri Lanka in our addressable market</p>
        </Card>
        <Card variant="soft">
          <p className="text-display-md font-display text-ink">1,200+</p>
          <p className="text-body-sm text-body mt-xs">Jobs completed through the platform to date</p>
        </Card>
        <Card variant="soft">
          <p className="text-display-md font-display text-ink">4.8★</p>
          <p className="text-body-sm text-body mt-xs">Average worker rating across all categories</p>
        </Card>
      </div>

      <div className="mt-3xl max-w-2xl">
        <h2 className="text-display-md font-display text-ink mb-lg">Our approach</h2>
        <div className="flex flex-col gap-lg">
          <div>
            <h3 className="text-body-lg font-text font-medium text-ink">Trust first</h3>
            <p className="text-body-md text-body mt-xs">
              Every worker is verified, rated after every job, and held to a completion-rate and
              no-show standard. Workers under 3.5★ are automatically removed.
            </p>
          </div>
          <div>
            <h3 className="text-body-lg font-text font-medium text-ink">Fair pricing</h3>
            <p className="text-body-md text-body mt-xs">
              We take a 12% commission on completed tasks — 9% for verified student workers — and
              nothing else. No listing fees, no subscriptions.
            </p>
          </div>
          <div>
            <h3 className="text-body-lg font-text font-medium text-ink">Built for Sri Lanka</h3>
            <p className="text-body-md text-body mt-xs">
              LKR pricing, local payment methods, and a dispute process designed around how work
              actually gets done here — not adapted from a foreign playbook.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3xl max-w-2xl text-body-sm text-mute border-t border-black/[0.06] pt-2xl">
        <p>Tasker (Private) Limited &middot; Business Registration No. PV 00123456</p>
        <p className="mt-xs">Registered office: 14 Duplication Road, Colombo 04, Sri Lanka</p>
      </div>
    </div>
  );
}
