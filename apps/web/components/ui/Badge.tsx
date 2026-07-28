import { BadgeCheck, Award, ShieldCheck, Zap } from "lucide-react";
import type { WorkerBadges } from "@taskhub/shared";
import { Pill } from "./Pill";

const BADGE_META = {
  verified: { label: "Verified", icon: BadgeCheck },
  reliability: { label: "99% on-time", icon: Zap },
  trusted: { label: "Trusted", icon: ShieldCheck },
  pro: { label: "Pro", icon: Award },
} as const;

type BadgeKey = keyof typeof BADGE_META;

export function BadgeRow({ badges }: { badges: WorkerBadges }) {
  const active = (Object.keys(BADGE_META) as BadgeKey[]).filter((k) => badges[k]);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-sm">
      {active.map((key: BadgeKey) => {
        const { label, icon: Icon } = BADGE_META[key];
        return (
          <Pill key={key} tone={key === "pro" ? "accent" : "neutral"} icon={<Icon size={13} />}>
            {label}
          </Pill>
        );
      })}
    </div>
  );
}
