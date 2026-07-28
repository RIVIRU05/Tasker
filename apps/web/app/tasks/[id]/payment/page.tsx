"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, Receipt } from "lucide-react";
import { getClient } from "@taskhub/data";
import type { Task, Transaction, User } from "@taskhub/shared";
import { formatLKR } from "@taskhub/shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
          {task.paymentStatus === "pending" && (
            <div className="text-center py-lg">
              <p className="text-body-md text-body">
                Accept a bid on this task to fund escrow and unlock payment.
              </p>
              <Button href={`/tasks/${task.id}`} variant="primary" className="mt-lg">
                View bids
              </Button>
            </div>
          )}

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
                  <span className="text-ink">{formatLKR(task.paymentAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-body">Platform fee</span>
                  <span className="text-ink">-{formatLKR(task.platformFee)}</span>
                </div>
                <div className="flex items-center justify-between text-body-md-strong pt-sm">
                  <span className="text-ink">Worker receives</span>
                  <span className="text-ink">{formatLKR(task.workerAmount)}</span>
                </div>
              </div>

              <div className="py-lg flex items-center gap-md">
                <span className="w-10 h-10 rounded-md bg-primary-600 text-on-dark flex items-center justify-center text-body-sm-strong">
                  KP
                </span>
                <div>
                  <p className="text-body-md-strong text-ink">Paid via Koko Pay</p>
                  <p className="text-body-sm text-mute">Mock transaction — no real charge (MVP)</p>
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
