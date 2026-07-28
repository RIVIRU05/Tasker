"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getClient } from "@taskhub/data";
import type { Dispute, Task, Transaction, User } from "@taskhub/shared";
import { formatLKR } from "@taskhub/shared";
import { useSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";

interface EnrichedDispute {
  dispute: Dispute;
  task?: Task;
  customer?: User;
  worker?: User;
  transaction?: Transaction;
}

export default function AdminPage() {
  const { user, loading } = useSession();
  const [rows, setRows] = useState<EnrichedDispute[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(true);

  const load = useCallback(async () => {
    const client = getClient();
    const disputes = await client.getDisputes();
    const enriched = await Promise.all(
      disputes.map(async (dispute) => {
        const [task, customer, worker, transaction] = await Promise.all([
          client.getTask(dispute.taskId),
          client.getUser(dispute.customerId),
          client.getUser(dispute.workerId),
          client.getTransactionForTask(dispute.taskId),
        ]);
        return { dispute, task, customer, worker, transaction };
      })
    );
    setRows(enriched);
    setLoadingDisputes(false);
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) load();
  }, [user, load]);

  if (loading) {
    return <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-body-md text-body">Loading…</div>;
  }

  if (!isAdmin(user)) {
    return (
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl text-center">
        <ShieldAlert size={32} className="mx-auto text-mute" />
        <h1 className="text-display-lg font-display text-ink mt-lg">Admin access only</h1>
        <p className="text-body-md text-body mt-sm">You don&apos;t have permission to view this page.</p>
        <Button href="/" variant="primary" className="mt-lg">
          Back home
        </Button>
      </div>
    );
  }

  const open = rows.filter((r) => r.dispute.status !== "resolved");
  const resolved = rows.filter((r) => r.dispute.status === "resolved");

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <h1 className="text-display-xl font-display text-ink">Disputes</h1>
      <p className="text-body-md text-body mt-sm">Review evidence and resolve open disputes.</p>

      <h2 className="text-display-sm font-display text-ink mt-3xl mb-lg">
        Needs attention ({open.length})
      </h2>
      {loadingDisputes && <p className="text-body-md text-mute">Loading disputes…</p>}
      {!loadingDisputes && open.length === 0 && (
        <Card variant="soft">
          <p className="text-body-md text-body">No open disputes right now.</p>
        </Card>
      )}
      <div className="flex flex-col gap-lg">
        {open.map((row) => (
          <DisputeCard key={row.dispute.id} row={row} onResolved={load} />
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="text-display-sm font-display text-ink mt-3xl mb-lg">Resolved ({resolved.length})</h2>
          <div className="flex flex-col gap-lg">
            {resolved.map((row) => (
              <DisputeCard key={row.dispute.id} row={row} onResolved={load} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DisputeCard({ row, onResolved }: { row: EnrichedDispute; onResolved: () => void }) {
  const { dispute, task, customer, worker, transaction } = row;
  const [busy, setBusy] = useState(false);

  async function resolve(resolution: "refund" | "partial" | "full_payment") {
    if (!transaction) return;
    setBusy(true);
    const amount = transaction.amount;
    await getClient().resolveDispute({
      disputeId: dispute.id,
      resolution,
      amountRefunded: resolution === "refund" ? amount : resolution === "partial" ? Math.round(amount / 2) : 0,
      amountPaidToWorker:
        resolution === "full_payment" ? transaction.workerAmount : resolution === "partial" ? Math.round(transaction.workerAmount / 2) : 0,
    });
    setBusy(false);
    onResolved();
  }

  return (
    <Card variant="content" className="border border-black/[0.06]">
      <div className="flex items-center justify-between gap-md mb-lg">
        {task ? (
          <Link href={`/tasks/${task.id}`} className="text-body-lg font-text font-medium text-ink hover:underline">
            {task.title}
          </Link>
        ) : (
          <span className="text-body-lg font-text font-medium text-ink">Task not found</span>
        )}
        <Pill tone={dispute.status === "resolved" ? "success" : "danger"}>{dispute.status}</Pill>
      </div>

      <div className="grid sm:grid-cols-2 gap-lg mb-lg">
        <div className="flex items-center gap-md">
          <Avatar src={customer?.photo} name={customer?.name ?? "Customer"} size={36} />
          <div>
            <p className="text-caption text-mute">Customer</p>
            <p className="text-body-sm-strong text-ink">{customer?.name ?? "Unknown"}</p>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <Avatar src={worker?.photo} name={worker?.name ?? "Worker"} size={36} />
          <div>
            <p className="text-caption text-mute">Worker</p>
            <p className="text-body-sm-strong text-ink">{worker?.name ?? "Unknown"}</p>
          </div>
        </div>
      </div>

      <div className="bg-canvas-soft rounded-md p-lg mb-md">
        <p className="text-caption text-mute mb-xs">Customer&apos;s description</p>
        <p className="text-body-sm text-ink">{dispute.customerDescription}</p>
      </div>

      {dispute.workerExplanation ? (
        <div className="bg-canvas-soft rounded-md p-lg mb-lg">
          <p className="text-caption text-mute mb-xs">Worker&apos;s explanation</p>
          <p className="text-body-sm text-ink">{dispute.workerExplanation}</p>
        </div>
      ) : (
        <p className="text-caption text-mute mb-lg">No response from worker yet.</p>
      )}

      {transaction && (
        <p className="text-body-sm text-body mb-lg">
          Escrow amount: <span className="text-ink font-text font-medium">{formatLKR(transaction.amount)}</span>{" "}
          (worker would receive {formatLKR(transaction.workerAmount)})
        </p>
      )}

      {dispute.status === "resolved" ? (
        <p className="text-body-sm-strong text-success">
          Resolved: {dispute.resolution?.replace("_", " ")}
          {dispute.amountRefunded ? ` · refunded ${formatLKR(dispute.amountRefunded)}` : ""}
          {dispute.amountPaidToWorker ? ` · paid worker ${formatLKR(dispute.amountPaidToWorker)}` : ""}
        </p>
      ) : (
        <div className="flex flex-wrap gap-sm">
          <Button variant="secondary" disabled={busy || !transaction} onClick={() => resolve("refund")}>
            Refund customer
          </Button>
          <Button variant="subtle" disabled={busy || !transaction} onClick={() => resolve("partial")}>
            Split 50/50
          </Button>
          <Button variant="primary" disabled={busy || !transaction} onClick={() => resolve("full_payment")}>
            Pay worker in full
          </Button>
        </div>
      )}
    </Card>
  );
}
