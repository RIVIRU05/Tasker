export type UserType = "customer" | "worker" | "both";

export type CountryCode = "LK" | "AU";

export type TaskCategory =
  | "plumbing"
  | "electrical"
  | "painting"
  | "moving"
  | "cleaning"
  | "carpentry"
  | "welding"
  | "gardening"
  | "appliance_repair"
  | "other";

export type TaskStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "disputed";

export type TaskTimeline = "urgent" | "flexible" | "scheduled";

export type BidStatus = "pending" | "accepted" | "rejected";

export type PaymentStatus = "pending" | "escrow" | "released" | "refunded";

export interface WorkerRating {
  avgStars: number;
  totalReviews: number;
  completedJobs: number;
  noShowCount: number;
  disputeCount: number;
}

export interface WorkerBadges {
  verified: boolean;
  reliability: boolean;
  trusted: boolean;
  pro: boolean;
}

export interface PaymentMethod {
  type: "koko_pay" | "bank_transfer" | "mobile_money" | "cash_pickup";
  verified: boolean;
  label: string;
}

export interface WorkerProfile {
  bio: string;
  skills: TaskCategory[];
  yearsExperience: number;
  portfolio: string[];
  rating: WorkerRating;
  badges: WorkerBadges;
  paymentMethods: PaymentMethod[];
  suspended: boolean;
  suspensionReason?: string;
  responseTimeMinutes: number;
  completionRate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  photo: string;
  location: string;
  userType: UserType;
  isStudent: boolean;
  studentEmail?: string;
  studentVerifiedAt?: string;
  workerProfile?: WorkerProfile;
  createdAt: string;
}

export interface Bid {
  id: string;
  taskId: string;
  workerId: string;
  offeredPrice: number;
  message: string;
  submittedAt: string;
  status: BidStatus;
}

export interface Message {
  id: string;
  taskId: string;
  fromUserId: string;
  text: string;
  attachments: string[];
  timestamp: string;
}

export interface PriceRevision {
  id: string;
  taskId: string;
  originalPrice: number;
  revisedPrice: number;
  reason: string;
  proof: string[];
  approvedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  photos: string[];
  location: {
    address: string;
    city: string;
    district?: string;
    country?: CountryCode;
    lat: number;
    lng: number;
  };
  budgetMin: number;
  budgetMax: number;
  timeline: TaskTimeline;
  scheduledDate?: string;
  status: TaskStatus;
  customerId: string;
  workerId?: string;
  completionPhotos: string[];
  completedAt?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  platformFee: number;
  workerAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  taskId: string;
  ratedById: string;
  ratedUserId: string;
  ratingType: "worker" | "customer";
  stars: number;
  review: string;
  categories: {
    communication: number;
    professionalism: number;
    quality: number;
    timeliness: number;
  };
  createdAt: string;
}

export type DisputeStatus = "open" | "reviewing" | "resolved";
export type DisputeResolution = "refund" | "partial" | "full_payment";

export interface Dispute {
  id: string;
  taskId: string;
  customerId: string;
  workerId: string;
  status: DisputeStatus;
  customerPhotos: string[];
  customerDescription: string;
  workerExplanation: string;
  workerPhotos: string[];
  resolution?: DisputeResolution;
  amountRefunded?: number;
  amountPaidToWorker?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface Transaction {
  id: string;
  taskId: string;
  customerId: string;
  workerId: string;
  amount: number;
  platformFee: number;
  workerAmount: number;
  status: PaymentStatus;
  createdAt: string;
  escrowStartedAt?: string;
  releasedAt?: string;
}

export interface LocationSuggestion {
  label: string;
  city: string;
  district?: string;
  province?: string;
  country?: CountryCode;
  address: string;
  lat: number;
  lng: number;
}

export const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
] as const;
