import {
  BIDS,
  DISPUTES,
  MESSAGES,
  RATINGS,
  TASKS,
  TRANSACTIONS,
  USERS,
  badgeEligibility,
  calculateWorkerPayout,
} from "@taskhub/shared";
import type { Bid, Dispute, Message, Rating, Task, Transaction, User } from "@taskhub/shared";
import type {
  NewBidInput,
  NewMessageInput,
  NewRatingInput,
  NewTaskInput,
  TaskFilters,
  TaskHubClient,
} from "./client";

const STORAGE_KEY = "taskhub_mock_store_v1";

interface StoreShape {
  users: User[];
  tasks: Task[];
  bids: Bid[];
  messages: Message[];
  ratings: Rating[];
  disputes: Dispute[];
  transactions: Transaction[];
  currentUserId: string | null;
}

function defaultStore(): StoreShape {
  return {
    users: structuredClone(USERS),
    tasks: structuredClone(TASKS),
    bids: structuredClone(BIDS),
    messages: structuredClone(MESSAGES),
    ratings: structuredClone(RATINGS),
    disputes: structuredClone(DISPUTES),
    transactions: structuredClone(TRANSACTIONS),
    currentUserId: null,
  };
}

function loadStore(): StoreShape {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    return JSON.parse(raw) as StoreShape;
  } catch {
    return defaultStore();
  }
}

function saveStore(store: StoreShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store: StoreShape | null = null;

function getStore(): StoreShape {
  if (!store) store = loadStore();
  return store;
}

function persist() {
  if (store) saveStore(store);
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function recalcRating(user: User, taskRatings: Rating[]) {
  if (!user.workerProfile) return;
  const stars = taskRatings.map((r) => r.stars);
  if (stars.length === 0) return;
  const avg = stars.reduce((a, b) => a + b, 0) / stars.length;
  user.workerProfile.rating.avgStars = Math.round(avg * 10) / 10;
  user.workerProfile.rating.totalReviews = stars.length;
  user.workerProfile.badges = badgeEligibility(user.workerProfile);
}

export class MockTaskHubClient implements TaskHubClient {
  async getCurrentUser(): Promise<User | null> {
    const s = getStore();
    return s.users.find((u) => u.id === s.currentUserId) ?? null;
  }

  async setCurrentUser(userId: string | null): Promise<void> {
    const s = getStore();
    s.currentUserId = userId;
    persist();
  }

  async signUp(input: Partial<User> & { email: string; name: string; password: string }): Promise<User> {
    const s = getStore();
    const existing = s.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      s.currentUserId = existing.id;
      persist();
      return existing;
    }
    const isStudent = Boolean(input.email.match(/\.ac\.lk$/i));
    const user: User = {
      id: uid("user"),
      email: input.email,
      name: input.name,
      phone: input.phone ?? "",
      photo: input.photo ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(input.email)}`,
      location: input.location ?? "Colombo",
      userType: input.userType ?? "customer",
      isStudent,
      studentEmail: isStudent ? input.email : undefined,
      studentVerifiedAt: isStudent ? nowIso() : undefined,
      createdAt: nowIso(),
      workerProfile:
        input.userType === "worker" || input.userType === "both"
          ? {
              bio: "",
              skills: [],
              yearsExperience: 0,
              portfolio: [],
              rating: { avgStars: 0, totalReviews: 0, completedJobs: 0, noShowCount: 0, disputeCount: 0 },
              badges: { verified: false, reliability: false, trusted: false, pro: false },
              paymentMethods: [],
              suspended: false,
              responseTimeMinutes: 60,
              completionRate: 1,
            }
          : undefined,
    };
    s.users.push(user);
    s.currentUserId = user.id;
    persist();
    return user;
  }

  async login(email: string): Promise<User> {
    const s = getStore();
    const user = s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("No account found with that email. Try signing up instead.");
    s.currentUserId = user.id;
    persist();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return structuredClone(getStore().users);
  }

  async getUser(id: string): Promise<User | undefined> {
    return structuredClone(getStore().users.find((u) => u.id === id));
  }

  async getWorkers(): Promise<User[]> {
    return structuredClone(getStore().users.filter((u) => Boolean(u.workerProfile)));
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User> {
    const s = getStore();
    const idx = s.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    s.users[idx] = { ...s.users[idx], ...patch };
    persist();
    return structuredClone(s.users[idx]);
  }

  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let tasks = structuredClone(getStore().tasks);
    if (filters?.category) tasks = tasks.filter((t) => t.category === filters.category);
    if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters?.city) tasks = tasks.filter((t) => t.location.city.toLowerCase().includes(filters.city!.toLowerCase()));
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return tasks.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getTask(id: string): Promise<Task | undefined> {
    return structuredClone(getStore().tasks.find((t) => t.id === id));
  }

  async createTask(input: NewTaskInput): Promise<Task> {
    const s = getStore();
    const task: Task = {
      id: uid("task"),
      title: input.title,
      description: input.description,
      category: input.category,
      photos: input.photos,
      location: input.location,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      timeline: input.timeline,
      scheduledDate: input.scheduledDate,
      status: "open",
      customerId: input.customerId,
      completionPhotos: [],
      paymentStatus: "pending",
      paymentAmount: 0,
      platformFee: 0,
      workerAmount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    s.tasks.unshift(task);
    persist();
    return structuredClone(task);
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    const s = getStore();
    const idx = s.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    s.tasks[idx] = { ...s.tasks[idx], ...patch, updatedAt: nowIso() };
    persist();
    return structuredClone(s.tasks[idx]);
  }

  async getBidsForTask(taskId: string): Promise<Bid[]> {
    return structuredClone(getStore().bids.filter((b) => b.taskId === taskId));
  }

  async getBidsByWorker(workerId: string): Promise<Bid[]> {
    return structuredClone(getStore().bids.filter((b) => b.workerId === workerId));
  }

  async submitBid(input: NewBidInput): Promise<Bid> {
    const s = getStore();
    const bid: Bid = {
      id: uid("bid"),
      taskId: input.taskId,
      workerId: input.workerId,
      offeredPrice: input.offeredPrice,
      message: input.message,
      submittedAt: nowIso(),
      status: "pending",
    };
    s.bids.push(bid);
    persist();
    return structuredClone(bid);
  }

  async acceptBid(bidId: string): Promise<Task> {
    const s = getStore();
    const bid = s.bids.find((b) => b.id === bidId);
    if (!bid) throw new Error("Bid not found");
    s.bids.filter((b) => b.taskId === bid.taskId).forEach((b) => {
      b.status = b.id === bidId ? "accepted" : "rejected";
    });
    const worker = s.users.find((u) => u.id === bid.workerId);
    const payout = calculateWorkerPayout(bid.offeredPrice, Boolean(worker?.isStudent));
    const idx = s.tasks.findIndex((t) => t.id === bid.taskId);
    if (idx === -1) throw new Error("Task not found");
    s.tasks[idx] = {
      ...s.tasks[idx],
      status: "assigned",
      workerId: bid.workerId,
      paymentStatus: "escrow",
      paymentAmount: bid.offeredPrice,
      platformFee: payout.platformFee,
      workerAmount: payout.workerAmount,
      updatedAt: nowIso(),
    };
    const txn: Transaction = {
      id: uid("txn"),
      taskId: bid.taskId,
      customerId: s.tasks[idx].customerId,
      workerId: bid.workerId,
      amount: bid.offeredPrice,
      platformFee: payout.platformFee,
      workerAmount: payout.workerAmount,
      status: "escrow",
      createdAt: nowIso(),
      escrowStartedAt: nowIso(),
    };
    s.transactions.push(txn);
    persist();
    return structuredClone(s.tasks[idx]);
  }

  async getMessages(taskId: string): Promise<Message[]> {
    return structuredClone(
      getStore()
        .messages.filter((m) => m.taskId === taskId)
        .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    );
  }

  async sendMessage(input: NewMessageInput): Promise<Message> {
    const s = getStore();
    const message: Message = {
      id: uid("msg"),
      taskId: input.taskId,
      fromUserId: input.fromUserId,
      text: input.text,
      attachments: input.attachments ?? [],
      timestamp: nowIso(),
    };
    s.messages.push(message);
    persist();
    return structuredClone(message);
  }

  async getRatingsForUser(userId: string): Promise<Rating[]> {
    return structuredClone(getStore().ratings.filter((r) => r.ratedUserId === userId));
  }

  async submitRating(input: NewRatingInput): Promise<Rating> {
    const s = getStore();
    const rating: Rating = {
      id: uid("rat"),
      taskId: input.taskId,
      ratedById: input.ratedById,
      ratedUserId: input.ratedUserId,
      ratingType: input.ratingType,
      stars: input.stars,
      review: input.review,
      categories: input.categories,
      createdAt: nowIso(),
    };
    s.ratings.push(rating);
    const user = s.users.find((u) => u.id === input.ratedUserId);
    if (user && input.ratingType === "worker") {
      recalcRating(
        user,
        s.ratings.filter((r) => r.ratedUserId === user.id)
      );
      if (user.workerProfile) {
        user.workerProfile.rating.completedJobs = s.tasks.filter(
          (t) => t.workerId === user.id && t.status === "completed"
        ).length;
      }
    }
    persist();
    return structuredClone(rating);
  }

  async getDisputesForTask(taskId: string): Promise<Dispute[]> {
    return structuredClone(getStore().disputes.filter((d) => d.taskId === taskId));
  }

  async getDisputes(status?: Dispute["status"]): Promise<Dispute[]> {
    const s = getStore();
    const disputes = status ? s.disputes.filter((d) => d.status === status) : s.disputes;
    return structuredClone(disputes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  }

  async createDispute(input: {
    taskId: string;
    customerId: string;
    workerId: string;
    customerDescription: string;
    customerPhotos?: string[];
  }): Promise<Dispute> {
    const s = getStore();
    const dispute: Dispute = {
      id: uid("disp"),
      taskId: input.taskId,
      customerId: input.customerId,
      workerId: input.workerId,
      status: "open",
      customerPhotos: input.customerPhotos ?? [],
      customerDescription: input.customerDescription,
      workerExplanation: "",
      workerPhotos: [],
      createdAt: nowIso(),
    };
    s.disputes.push(dispute);
    const taskIdx = s.tasks.findIndex((t) => t.id === input.taskId);
    if (taskIdx !== -1) s.tasks[taskIdx].status = "disputed";
    persist();
    return structuredClone(dispute);
  }

  async resolveDispute(input: {
    disputeId: string;
    resolution: "refund" | "partial" | "full_payment";
    amountRefunded?: number;
    amountPaidToWorker?: number;
  }): Promise<Dispute> {
    const s = getStore();
    const disputeIdx = s.disputes.findIndex((d) => d.id === input.disputeId);
    if (disputeIdx === -1) throw new Error("Dispute not found");
    const dispute = s.disputes[disputeIdx];
    s.disputes[disputeIdx] = {
      ...dispute,
      status: "resolved",
      resolution: input.resolution,
      amountRefunded: input.amountRefunded,
      amountPaidToWorker: input.amountPaidToWorker,
      resolvedAt: nowIso(),
    };

    const taskIdx = s.tasks.findIndex((t) => t.id === dispute.taskId);
    const txnIdx = s.transactions.findIndex((t) => t.taskId === dispute.taskId);
    const paymentStatus = input.resolution === "refund" ? "refunded" : "released";
    if (taskIdx !== -1) {
      s.tasks[taskIdx] = { ...s.tasks[taskIdx], status: "completed", paymentStatus, updatedAt: nowIso() };
    }
    if (txnIdx !== -1) {
      s.transactions[txnIdx] = {
        ...s.transactions[txnIdx],
        status: paymentStatus,
        releasedAt: paymentStatus === "released" ? nowIso() : s.transactions[txnIdx].releasedAt,
      };
    }
    persist();
    return structuredClone(s.disputes[disputeIdx]);
  }

  async getTransactionForTask(taskId: string): Promise<Transaction | undefined> {
    return structuredClone(getStore().transactions.find((t) => t.taskId === taskId));
  }

  async releasePayment(taskId: string): Promise<Transaction> {
    const s = getStore();
    const idx = s.transactions.findIndex((t) => t.taskId === taskId);
    if (idx === -1) throw new Error("Transaction not found");
    s.transactions[idx] = { ...s.transactions[idx], status: "released", releasedAt: nowIso() };
    const taskIdx = s.tasks.findIndex((t) => t.id === taskId);
    if (taskIdx !== -1) s.tasks[taskIdx].paymentStatus = "released";
    persist();
    return structuredClone(s.transactions[idx]);
  }

  async markTaskComplete(taskId: string, completionPhotos: string[]): Promise<Task> {
    const s = getStore();
    const idx = s.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error("Task not found");
    s.tasks[idx] = {
      ...s.tasks[idx],
      status: "completed",
      completionPhotos,
      completedAt: nowIso(),
      updatedAt: nowIso(),
    };
    persist();
    return structuredClone(s.tasks[idx]);
  }

  async approveCompletion(taskId: string): Promise<Task> {
    await this.releasePayment(taskId);
    const s = getStore();
    const idx = s.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error("Task not found");
    const task = s.tasks[idx];
    const worker = s.users.find((u) => u.id === task.workerId);
    if (worker?.workerProfile) {
      worker.workerProfile.rating.completedJobs += 1;
    }
    persist();
    return structuredClone(task);
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    const workers = getStore().users.filter((u) => u.workerProfile);
    return structuredClone(
      workers
        .sort((a, b) => {
          const ra = a.workerProfile!.rating;
          const rb = b.workerProfile!.rating;
          if (rb.avgStars !== ra.avgStars) return rb.avgStars - ra.avgStars;
          return rb.completedJobs - ra.completedJobs;
        })
        .slice(0, limit)
    );
  }
}
