import type { WorkerProfile } from "./types";

export const REGULAR_COMMISSION_RATE = 0.2;
export const STUDENT_COMMISSION_RATE = 0.15;
export const STUDENT_CUSTOMER_DISCOUNT = 0.1;

export const MIN_JOBS_FOR_HIGH_VISIBILITY = 5;
export const AUTO_REMOVAL_RATING_THRESHOLD = 3.5;
export const NO_SHOW_SUSPENSION_THRESHOLD = 3;

export const DISPUTE_GRACE_PERIOD_HOURS = 48;
export const DISPUTE_REVIEW_DAYS_MIN = 3;
export const DISPUTE_REVIEW_DAYS_MAX = 5;
export const AUTO_APPROVE_HOURS = 48;

export function commissionRate(isStudent: boolean): number {
  return isStudent ? STUDENT_COMMISSION_RATE : REGULAR_COMMISSION_RATE;
}

export function calculateWorkerPayout(amount: number, isStudentWorker: boolean) {
  const rate = commissionRate(isStudentWorker);
  const platformFee = Math.round(amount * rate);
  const workerAmount = amount - platformFee;
  return { platformFee, workerAmount, rate };
}

export function calculateCustomerPrice(amount: number, isStudentCustomer: boolean) {
  if (!isStudentCustomer) return amount;
  return Math.round(amount * (1 - STUDENT_CUSTOMER_DISCOUNT));
}

export function badgeEligibility(profile: WorkerProfile) {
  const { rating } = profile;
  return {
    verified: profile.badges.verified,
    reliability: rating.completedJobs > 0 && rating.noShowCount / Math.max(rating.completedJobs, 1) < 0.01,
    trusted: rating.completedJobs >= 50 && rating.disputeCount === 0,
    pro: rating.completedJobs >= 100 && rating.avgStars >= 4.5,
  };
}

export function shouldAutoRemove(profile: WorkerProfile) {
  return (
    profile.rating.totalReviews >= 5 &&
    profile.rating.avgStars < AUTO_REMOVAL_RATING_THRESHOLD
  );
}

export function shouldSuspendForNoShows(profile: WorkerProfile) {
  return profile.rating.noShowCount >= NO_SHOW_SUSPENSION_THRESHOLD;
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  painting: "Painting",
  moving: "Moving",
  cleaning: "Cleaning",
  carpentry: "Carpentry",
  welding: "Welding",
  gardening: "Gardening",
  appliance_repair: "Appliance Repair",
  other: "Other",
};

export const CATEGORY_ICONS: Record<string, string> = {
  plumbing: "wrench",
  electrical: "zap",
  painting: "paintbrush",
  moving: "truck",
  cleaning: "sparkles",
  carpentry: "hammer",
  welding: "flame",
  gardening: "leaf",
  appliance_repair: "settings",
  other: "grid",
};
