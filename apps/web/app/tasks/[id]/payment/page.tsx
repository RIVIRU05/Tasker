"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, Receipt, ShieldCheck } from "lucide-react";
import { getClient } from "@taskhub/data";
import type { Task, Transaction, User } from "@taskhub/shared";
import { formatMoney } from "@taskhub/shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function PayPalMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="rounded-md bg-white border border-black/[0.08] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: size * 0.46, lineHeight: 1 }} className="flex">
        <span style={{ color: "#003087", fontWeight: 800, fontStyle: "italic" }}>P</span>
        <span style={{ color: "#009cde", fontWeight: 800, fontStyle: "italic", marginLeft: -size * 0.12 }}>P</span>
      </span>
    </span>
  );
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [txn, setTxn] = useState<Transaction | undefined>(undefined);
  const [worker, setWorker] = useState<User | null>(null);

  const load = useCallback(async () => {
    const client = getClient();
    const t = await client.getTask(params.id);
    setTask(t ?? null);
    if (t) {
      const transaction = await client.getTransactionForTask(t.id);
      setTxn(transaction);
      if (t.workerId) setWorker((await client.getUser(t.workerId)) ?? null);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!task) {
    return <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-body-md text-body">Loading…</div>;
  }

  const isPaid = task.paymentStatus === "pending" ? false : true;

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="max-w-lg mx-auto">
        <h1 className="text-display-lg font-display text-ink text-center">Payment</h1>
        <p className="text-body-md text-body text-center mt-sm">{task.title}</p>

        <Card variant="elevated" className="mt-2xl">
          {task.status === "open" && (
            <div className="text-center py-lg">
              <p className="text-body-md text-body">
                Accept a bid on this task to fund escrow and unlock payment.
              </p>
              <Button href={`/tasks/${task.id}`} variant="primary" className="mt-lg">
                View bids
              </Button>
            </div>
          )}

          {task.status !== "open" && !isPaid && <PayNowCard task={task} onPaid={load} />}

          {isPaid && (
            <>
              <div className="flex items-center justify-between pb-lg border-b border-black/[0.06]">
                <span className="text-body-sm text-body">Status</span>
                <span
                  className={`inline-flex items-center gap-xs text-body-sm-strong px-lg py-sm rounded-pill ${
                    task.paymentStatus === "released" ? "bg-success/10 text-success" : "bg-accent-100 text-accent-800"
                  }`}
                >
                  <Lock size={13} />
                  {task.paymentStatus === "released" ? "Released to worker" : "Held in escrow"}
                </span>
              </div>

              <div className="py-lg border-b border-black/[0.06] flex flex-col gap-sm">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-body">Agreed price</span>
                  <span className="text-ink">{formatMoney(task.paymentAmount, task.location.country)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-body">Platform fee</span>
                  <span className="text-ink">-{formatMoney(task.platformFee, task.location.country)}</span>
                </div>
                <div className="flex items-center justify-between text-body-md-strong pt-sm">
                  <span className="text-ink">Worker receives</span>
                  <span className="text-ink">{formatMoney(task.workerAmount, task.location.country)}</span>
                </div>
              </div>

              <div className="py-lg flex items-center gap-md">
                <PayPalMark />
                <div>
                  <p className="text-body-md-strong text-ink">Paid via PayPal</p>
                  <p className="text-body-sm text-mute">Demo transaction, no real charge</p>
                </div>
              </div>

              {worker && txn && (
                <div className="mt-lg pt-lg border-t border-black/[0.06]">
                  <p className="text-body-sm-strong text-ink mb-sm flex items-center gap-xs">
                    <Receipt size={15} /> Receipt
                  </p>
                  <p className="text-caption text-mute">Transaction ID: {txn.id}</p>
                  <p className="text-caption text-mute">Paid to: {worker.name}</p>
                  <p className="text-caption text-mute">
                    {txn.status === "released" && txn.releasedAt
                      ? `Released ${new Date(txn.releasedAt).toLocaleDateString("en-GB")}`
                      : `Escrow started ${txn.escrowStartedAt ? new Date(txn.escrowStartedAt).toLocaleDateString("en-GB") : ""}`}
                  </p>
                </div>
              )}

              {task.paymentStatus === "released" && (
                <div className="mt-lg flex items-center gap-xs text-body-sm-strong text-success">
                  <CheckCircle2 size={16} /> Payment complete
                </div>
              )}

              <Link href={`/tasks/${task.id}`} className="block text-center text-body-sm text-ink underline mt-2xl">
                Back to task
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function PayNowCard({ task, onPaid }: { task: Task; onPaid: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await getClient().fundEscrow(task.id);
    setProcessing(false);
    onPaid();
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-lg border-b border-black/[0.06]">
        <span className="text-body-sm text-body">Amount due</span>
        <span className="text-display-sm font-display text-ink">{formatMoney(task.paymentAmount, task.location.country)}</span>
      </div>

      <form onSubmit={handlePay} className="flex flex-col gap-lg py-lg">
        <div className="flex items-center gap-sm">
          <PayPalMark />
          <p className="text-body-md-strong text-ink">Pay with PayPal</p>
        </div>
        <Input
          id="card"
          label="Card number"
          placeholder="4111 1111 1111 1111"
          required
          maxLength={19}
          value={card}
          onChange={(e) => setCard(e.target.value)}
          hint="Demo checkout: any card number works, nothing is actually charged."
        />
        <div className="grid grid-cols-2 gap-lg">
          <Input id="expiry" label="Expiry" placeholder="12/28" required />
          <Input id="cvv" label="CVV" placeholder="123" required maxLength={3} />
        </div>
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={processing}>
          {processing ? "Processing…" : `Pay ${formatMoney(task.paymentAmount, task.location.country)}`}
        </Button>
        <p className="flex items-center gap-xs text-caption text-mute justify-center">
          <ShieldCheck size={13} /> Held in escrow until you approve the finished work
        </p>
      </form>
    </div>
  );
}
