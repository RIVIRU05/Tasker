import type {
  Bid,
  CountryCode,
  Dispute,
  DisputeResolution,
  DisputeStatus,
  Message,
  Rating,
  Task,
  TaskCategory,
  TaskStatus,
  Transaction,
  User,
} from "@taskhub/shared";

export interface TaskFilters {
  category?: TaskCategory;
  status?: TaskStatus;
  city?: string;
  district?: string;
  country?: CountryCode;
  query?: string;
}

export interface NewTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  photos: string[];
  location: { address: string; city: string; district?: string; country?: CountryCode; lat: number; lng: number };
  budgetMin: number;
  budgetMax: number;
  timeline: Task["timeline"];
  scheduledDate?: string;
  customerId: string;
}

export interface NewBidInput {
  taskId: string;
  workerId: string;
  offeredPrice: number;
  message: string;
}

export interface NewMessageInput {
  taskId: string;
  fromUserId: string;
  text: string;
  attachments?: string[];
}

export interface NewRatingInput {
  taskId: string;
  ratedById: string;
  ratedUserId: string;
  ratingType: "worker" | "customer";
  stars: number;
  review: string;
  categories: Rating["categories"];
}

export interface NewDisputeInput {
  taskId: string;
  customerId: string;
  workerId: string;
  customerDescription: string;
  customerPhotos?: string[];
}

export interface ResolveDisputeInput {
  disputeId: string;
  resolution: DisputeResolution;
  amountRefunded?: number;
  amountPaidToWorker?: number;
}

export interface TaskHubClient {
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(userId: string | null): Promise<void>;
  signUp(input: Partial<User> & { email: string; name: string; password: string }): Promise<User>;
  login(email: string, password?: string): Promise<User>;

  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getWorkers(): Promise<User[]>;
  updateUser(id: string, patch: Partial<User>): Promise<User>;

  getTasks(filters?: TaskFilters): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(input: NewTaskInput): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task>;

  getBidsForTask(taskId: string): Promise<Bid[]>;
  getBidsByWorker(workerId: string): Promise<Bid[]>;
  submitBid(input: NewBidInput): Promise<Bid>;
  acceptBid(bidId: string): Promise<Task>;

  getMessages(taskId: string): Promise<Message[]>;
  sendMessage(input: NewMessageInput): Promise<Message>;

  getRatingsForUser(userId: string): Promise<Rating[]>;
  submitRating(input: NewRatingInput): Promise<Rating>;

  getDisputesForTask(taskId: string): Promise<Dispute[]>;
  getDisputes(status?: DisputeStatus): Promise<Dispute[]>;
  createDispute(input: NewDisputeInput): Promise<Dispute>;
  resolveDispute(input: ResolveDisputeInput): Promise<Dispute>;

  getTransactionForTask(taskId: string): Promise<Transaction | undefined>;
  fundEscrow(taskId: string): Promise<Transaction>;
  releasePayment(taskId: string): Promise<Transaction>;

  markTaskComplete(taskId: string, completionPhotos: string[]): Promise<Task>;
  approveCompletion(taskId: string): Promise<Task>;

  getLeaderboard(limit?: number): Promise<User[]>;
}
