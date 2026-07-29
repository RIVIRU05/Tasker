import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc as getDocRaw,
  getDocs as getDocsRaw,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Query,
} from "firebase/firestore";
import { badgeEligibility, calculateWorkerPayout } from "@taskhub/shared";
import type { Bid, Dispute, Message, Rating, Task, Transaction, User } from "@taskhub/shared";
import { getFirebaseAuth, getFirebaseDb } from "./firebase/app";
import { deletePhotoByUrl } from "./firebase/storage";
import type {
  NewBidInput,
  NewMessageInput,
  NewRatingInput,
  NewTaskInput,
  TaskFilters,
  TaskHubClient,
} from "./client";

function nowIso() {
  return new Date().toISOString();
}

// React Native/Hermes' fetch intermittently fails in-flight requests unrelated to actual connectivity.
// Retry both auth's network errors and Firestore's "unavailable" (client offline) code before giving up.
const RETRYABLE_CODES = new Set(["auth/network-request-failed", "unavailable"]);

async function withNetworkRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (!RETRYABLE_CODES.has(code ?? "") || attempt === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt + Math.random() * 300));
    }
  }
  throw new Error("unreachable");
}

function getDoc<T>(ref: DocumentReference<T>) {
  return withNetworkRetry(() => getDocRaw(ref));
}

function getDocs<T>(q: Query<T>) {
  return withNetworkRetry(() => getDocsRaw(q));
}

/** Firestore rejects `undefined` field values outright, so strip them before every write. */
function stripUndefined<T extends object>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    clean[key] =
      value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)
        ? stripUndefined(value as Record<string, unknown>)
        : value;
  }
  return clean as T;
}

export class FirebaseTaskHubClient implements TaskHubClient {
  private authReady: Promise<void>;
  private currentUid: string | null = null;

  constructor() {
    const auth = getFirebaseAuth();
    this.authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        this.currentUid = user?.uid ?? null;
        unsubscribe();
        resolve();
      });
    });
  }

  private col(name: string) {
    return collection(getFirebaseDb(), name);
  }

  async getCurrentUser(): Promise<User | null> {
    await this.authReady;
    const auth = getFirebaseAuth();
    const uid = auth.currentUser?.uid ?? this.currentUid;
    if (!uid) return null;
    return (await this.getUser(uid)) ?? null;
  }

  async setCurrentUser(userId: string | null): Promise<void> {
    if (userId === null) {
      await signOut(getFirebaseAuth());
    }
  }

  async signUp(input: Partial<User> & { email: string; name: string; password: string }): Promise<User> {
    const auth = getFirebaseAuth();
    const credential = await withNetworkRetry(() =>
      createUserWithEmailAndPassword(auth, input.email, input.password)
    );
    const uid = credential.user.uid;
    const isStudent = Boolean(input.email.match(/\.(ac\.lk|edu\.au)$/i));
    const isWorker = input.userType === "worker" || input.userType === "both";

    const user: User = {
      id: uid,
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
      workerProfile: isWorker
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

    await setDoc(doc(getFirebaseDb(), "users", uid), stripUndefined({ ...user, isWorker }));
    return user;
  }

  async login(email: string, password?: string): Promise<User> {
    if (!password) throw new Error("Password is required");
    const credential = await withNetworkRetry(() =>
      signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    );
    const user = await this.getUser(credential.user.uid);
    if (!user) throw new Error("Account exists in Auth but has no profile document");
    return user;
  }

  async getUsers(): Promise<User[]> {
    const snap = await getDocs(this.col("users"));
    return snap.docs.map((d) => d.data() as User);
  }

  async getUser(id: string): Promise<User | undefined> {
    const snap = await getDoc(doc(getFirebaseDb(), "users", id));
    return snap.exists() ? (snap.data() as User) : undefined;
  }

  async getWorkers(): Promise<User[]> {
    const snap = await getDocs(query(this.col("users"), where("isWorker", "==", true)));
    return snap.docs.map((d) => d.data() as User);
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User> {
    await updateDoc(doc(getFirebaseDb(), "users", id), stripUndefined({ ...patch }));
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found after update");
    return user;
  }

  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let tasks: Task[];
    if (filters?.category) {
      const snap = await getDocs(query(this.col("tasks"), where("category", "==", filters.category)));
      tasks = snap.docs.map((d) => d.data() as Task);
    } else {
      const snap = await getDocs(this.col("tasks"));
      tasks = snap.docs.map((d) => d.data() as Task);
    }
    if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters?.city) tasks = tasks.filter((t) => t.location.city.toLowerCase().includes(filters.city!.toLowerCase()));
    if (filters?.district) tasks = tasks.filter((t) => t.location.district === filters.district);
    if (filters?.country) tasks = tasks.filter((t) => t.location.country === filters.country);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return tasks.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const snap = await getDoc(doc(getFirebaseDb(), "tasks", id));
    return snap.exists() ? (snap.data() as Task) : undefined;
  }

  async createTask(input: NewTaskInput): Promise<Task> {
    const ref = doc(this.col("tasks"));
    const task: Task = {
      id: ref.id,
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
    await setDoc(ref, stripUndefined(task));
    return task;
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    await updateDoc(doc(getFirebaseDb(), "tasks", id), stripUndefined({ ...patch, updatedAt: nowIso() }));
    const task = await this.getTask(id);
    if (!task) throw new Error("Task not found after update");
    return task;
  }

  async getBidsForTask(taskId: string): Promise<Bid[]> {
    const snap = await getDocs(query(this.col("bids"), where("taskId", "==", taskId)));
    return snap.docs.map((d) => d.data() as Bid);
  }

  async getBidsByWorker(workerId: string): Promise<Bid[]> {
    const snap = await getDocs(query(this.col("bids"), where("workerId", "==", workerId)));
    return snap.docs.map((d) => d.data() as Bid);
  }

  async submitBid(input: NewBidInput): Promise<Bid> {
    const ref = doc(this.col("bids"));
    const bid: Bid = {
      id: ref.id,
      taskId: input.taskId,
      workerId: input.workerId,
      offeredPrice: input.offeredPrice,
      message: input.message,
      submittedAt: nowIso(),
      status: "pending",
    };
    await setDoc(ref, bid);
    return bid;
  }

  async acceptBid(bidId: string): Promise<Task> {
    const db = getFirebaseDb();
    const bidSnap = await getDoc(doc(db, "bids", bidId));
    if (!bidSnap.exists()) throw new Error("Bid not found");
    const bid = bidSnap.data() as Bid;

    const worker = await this.getUser(bid.workerId);
    const payout = calculateWorkerPayout(bid.offeredPrice, Boolean(worker?.isStudent));

    const siblingSnap = await getDocs(query(this.col("bids"), where("taskId", "==", bid.taskId)));

    const batch = writeBatch(db);
    siblingSnap.docs.forEach((d) => {
      batch.update(d.ref, { status: d.id === bidId ? "accepted" : "rejected" });
    });

    const taskRef = doc(db, "tasks", bid.taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const task = taskSnap.data() as Task;

    batch.update(taskRef, {
      status: "assigned",
      workerId: bid.workerId,
      paymentStatus: "pending",
      paymentAmount: bid.offeredPrice,
      platformFee: payout.platformFee,
      workerAmount: payout.workerAmount,
      updatedAt: nowIso(),
    });

    await batch.commit();
    const updated = await this.getTask(bid.taskId);
    if (!updated) throw new Error("Task not found after accept");
    return updated;
  }

  async fundEscrow(taskId: string): Promise<Transaction> {
    const db = getFirebaseDb();
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");
    if (!task.workerId) throw new Error("Task has no assigned worker yet");

    const txnRef = doc(this.col("transactions"));
    const txn: Transaction = {
      id: txnRef.id,
      taskId: task.id,
      customerId: task.customerId,
      workerId: task.workerId,
      amount: task.paymentAmount,
      platformFee: task.platformFee,
      workerAmount: task.workerAmount,
      status: "escrow",
      createdAt: nowIso(),
      escrowStartedAt: nowIso(),
    };

    const batch = writeBatch(db);
    batch.set(txnRef, txn);
    batch.update(doc(db, "tasks", taskId), { paymentStatus: "escrow", updatedAt: nowIso() });
    await batch.commit();

    return txn;
  }

  async getMessages(taskId: string): Promise<Message[]> {
    const snap = await getDocs(query(this.col("messages"), where("taskId", "==", taskId)));
    return snap.docs.map((d) => d.data() as Message).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  }

  async sendMessage(input: NewMessageInput): Promise<Message> {
    const ref = doc(this.col("messages"));
    const message: Message = {
      id: ref.id,
      taskId: input.taskId,
      fromUserId: input.fromUserId,
      text: input.text,
      attachments: input.attachments ?? [],
      timestamp: nowIso(),
    };
    await setDoc(ref, message);
    return message;
  }

  async getRatingsForUser(userId: string): Promise<Rating[]> {
    const snap = await getDocs(query(this.col("ratings"), where("ratedUserId", "==", userId)));
    return snap.docs.map((d) => d.data() as Rating);
  }

  async submitRating(input: NewRatingInput): Promise<Rating> {
    const ref = doc(this.col("ratings"));
    const rating: Rating = {
      id: ref.id,
      taskId: input.taskId,
      ratedById: input.ratedById,
      ratedUserId: input.ratedUserId,
      ratingType: input.ratingType,
      stars: input.stars,
      review: input.review,
      categories: input.categories,
      createdAt: nowIso(),
    };
    await setDoc(ref, rating);

    if (input.ratingType === "worker") {
      const user = await this.getUser(input.ratedUserId);
      if (user?.workerProfile) {
        const allRatings = await this.getRatingsForUser(input.ratedUserId);
        const stars = allRatings.map((r) => r.stars);
        const avg = Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 10) / 10;
        const updatedProfile = {
          ...user.workerProfile,
          rating: { ...user.workerProfile.rating, avgStars: avg, totalReviews: stars.length },
        };
        updatedProfile.badges = badgeEligibility(updatedProfile);
        await updateDoc(doc(getFirebaseDb(), "users", input.ratedUserId), { workerProfile: updatedProfile });
      }
    }

    return rating;
  }

  async getDisputesForTask(taskId: string): Promise<Dispute[]> {
    const snap = await getDocs(query(this.col("disputes"), where("taskId", "==", taskId)));
    return snap.docs.map((d) => d.data() as Dispute);
  }

  async getDisputes(status?: Dispute["status"]): Promise<Dispute[]> {
    const snap = await getDocs(this.col("disputes"));
    let disputes = snap.docs.map((d) => d.data() as Dispute);
    if (status) disputes = disputes.filter((d) => d.status === status);
    return disputes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async createDispute(input: {
    taskId: string;
    customerId: string;
    workerId: string;
    customerDescription: string;
    customerPhotos?: string[];
  }): Promise<Dispute> {
    const ref = doc(this.col("disputes"));
    const dispute: Dispute = {
      id: ref.id,
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
    await setDoc(ref, stripUndefined(dispute));
    await updateDoc(doc(getFirebaseDb(), "tasks", input.taskId), { status: "disputed", updatedAt: nowIso() });
    return dispute;
  }

  async resolveDispute(input: {
    disputeId: string;
    resolution: "refund" | "partial" | "full_payment";
    amountRefunded?: number;
    amountPaidToWorker?: number;
  }): Promise<Dispute> {
    const db = getFirebaseDb();
    const disputeRef = doc(db, "disputes", input.disputeId);
    const disputeSnap = await getDoc(disputeRef);
    if (!disputeSnap.exists()) throw new Error("Dispute not found");
    const dispute = disputeSnap.data() as Dispute;

    const patch = stripUndefined({
      status: "resolved" as const,
      resolution: input.resolution,
      amountRefunded: input.amountRefunded,
      amountPaidToWorker: input.amountPaidToWorker,
      resolvedAt: nowIso(),
    });
    await updateDoc(disputeRef, patch);

    const paymentStatus = input.resolution === "refund" ? "refunded" : "released";
    const workerAmount = input.amountPaidToWorker ?? 0;
    await updateDoc(doc(db, "tasks", dispute.taskId), {
      status: "completed",
      paymentStatus,
      workerAmount,
      updatedAt: nowIso(),
    });

    const txnSnap = await getDocs(query(this.col("transactions"), where("taskId", "==", dispute.taskId)));
    const txnDoc = txnSnap.docs[0];
    if (txnDoc) {
      await updateDoc(
        txnDoc.ref,
        stripUndefined({
          status: paymentStatus,
          workerAmount,
          releasedAt: paymentStatus === "released" ? nowIso() : undefined,
        })
      );
    }

    const updated = await getDoc(disputeRef);
    return updated.data() as Dispute;
  }

  async getTransactionForTask(taskId: string): Promise<Transaction | undefined> {
    const snap = await getDocs(query(this.col("transactions"), where("taskId", "==", taskId)));
    return snap.docs[0]?.data() as Transaction | undefined;
  }

  async releasePayment(taskId: string): Promise<Transaction> {
    const db = getFirebaseDb();
    const snap = await getDocs(query(this.col("transactions"), where("taskId", "==", taskId)));
    const txnDoc = snap.docs[0];
    if (!txnDoc) throw new Error("Transaction not found");
    await updateDoc(txnDoc.ref, { status: "released", releasedAt: nowIso() });
    await updateDoc(doc(db, "tasks", taskId), { paymentStatus: "released" });
    const updated = await getDoc(txnDoc.ref);
    return updated.data() as Transaction;
  }

  async markTaskComplete(taskId: string, completionPhotos: string[]): Promise<Task> {
    await updateDoc(doc(getFirebaseDb(), "tasks", taskId), {
      status: "completed",
      completionPhotos,
      completedAt: nowIso(),
      updatedAt: nowIso(),
    });
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async approveCompletion(taskId: string): Promise<Task> {
    await this.releasePayment(taskId);
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");
    if (task.workerId) {
      await updateDoc(doc(getFirebaseDb(), "users", task.workerId), {
        "workerProfile.rating.completedJobs": increment(1),
      });
    }
    // Only reached when paymentStatus was "escrow", meaning no dispute was ever filed, so this is safe to delete now.
    if (task.completionPhotos.length > 0) {
      await Promise.allSettled(task.completionPhotos.map((url) => deletePhotoByUrl(url)));
      await updateDoc(doc(getFirebaseDb(), "tasks", taskId), { completionPhotos: [] });
      task.completionPhotos = [];
    }
    return task;
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    const workers = await this.getWorkers();
    return workers
      .sort((a, b) => {
        const ra = a.workerProfile!.rating;
        const rb = b.workerProfile!.rating;
        if (rb.avgStars !== ra.avgStars) return rb.avgStars - ra.avgStars;
        return rb.completedJobs - ra.completedJobs;
      })
      .slice(0, limit);
  }
}
