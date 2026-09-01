"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Mail, CheckCircle2, Calendar, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ComposeEmailDialog, FollowUpFormDialog } from "@/components/email/compose-email-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { useCRMStore, usePermissions } from "@/store/CRMStoreProvider";
import { followUpService } from "@/services";
import type { FollowUpStatus } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateReply } from "@/services/mock/aiService";

const statusConfig: Record<FollowUpStatus, { label: string; color: string }> = {
  overdue: { label: "Overdue", color: "text-red-600" },
  today: { label: "Today", color: "text-warning" },
  upcoming: { label: "Upcoming", color: "text-foreground" },
  completed: { label: "Completed", color: "text-success" },
};

export default function FollowUpsPage() {
  const { getFollowUps, getCustomer } = useCRMStore();
  const { canEdit } = usePermissions();
  const followUps = getFollowUps();

  const [filter, setFilter] = useState<FollowUpStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState<{ to?: string; subject?: string; body?: string; customerId?: string; dealId?: string }>({});
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    overdue: followUps.filter((f) => f.status === "overdue").length,
    today: followUps.filter((f) => f.status === "today").length,
    upcoming: followUps.filter((f) => f.status === "upcoming").length,
    completed: followUps.filter((f) => f.status === "completed").length,
  }), [followUps]);

  const filtered = filter === "all" ? followUps : followUps.filter((f) => f.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Center"
        description="Stay on top of customer follow-ups and action items."
        actions={
          canEdit ? (
            <Button variant="accent" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Follow-up
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(statusConfig) as FollowUpStatus[]).map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)}>
            <KpiCard
              label={statusConfig[status].label.toUpperCase()}
              value={String(counts[status])}
              className={cn("transition-all", filter === status && "ring-2 ring-primary")}
            />
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No follow-ups found"
          description="Create a follow-up to track customer actions."
          actionLabel={canEdit ? "Create Follow-up" : undefined}
          onAction={canEdit ? () => setFormOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((fu) => (
            <Card key={fu.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{fu.customerName}</p>
                  <p className="text-sm text-muted-foreground">{fu.title}</p>
                  <p className="mt-1 text-sm">
                    Deal: <Link href={`/deals/${fu.dealId}`} className="font-medium hover:underline">{fu.dealTitle}</Link>
                  </p>
                  <p className={cn("mt-2 flex items-center gap-1 text-sm", statusConfig[fu.status].color)}>
                    <Calendar className="h-4 w-4" />
                    Due: {formatDateTime(fu.dueDate)}
                  </p>
                </div>
                {canEdit && fu.status !== "completed" && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ai" size="sm" onClick={() => {
                      const customer = getCustomer(fu.customerId);
                      const draft = generateReply(
                        { from: fu.customerName, subject: fu.title, messages: [{ id: "1", from: "", to: "", date: "", body: fu.description ?? fu.title }] },
                        "Sales Team"
                      );
                      setComposeDefaults({
                        to: customer?.contactEmail ?? "",
                        subject: `Follow-up: ${fu.title}`,
                        body: draft,
                        customerId: fu.customerId,
                        dealId: fu.dealId,
                      });
                      setComposeOpen(true);
                    }}>
                      <Mail className="h-4 w-4" />
                      Generate Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                      await followUpService.completeFollowUp(fu.id);
                      toast.success("Follow-up completed");
                    }}>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditId(fu.id)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setRescheduleId(fu.id);
                      setRescheduleDate(fu.dueDate.slice(0, 16));
                    }}>
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(fu.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rescheduleId} onOpenChange={() => setRescheduleId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reschedule Follow-up</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>New due date</Label>
            <Input type="datetime-local" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleId(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (rescheduleId && rescheduleDate) {
                await followUpService.rescheduleFollowUp(rescheduleId, new Date(rescheduleDate).toISOString());
                toast.success("Follow-up rescheduled");
                setRescheduleId(null);
              }
            }}>Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete follow-up?"
        description="This follow-up will be removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) {
            await followUpService.deleteFollowUp(deleteId);
            toast.success("Follow-up deleted");
          }
        }}
      />

      <FollowUpFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <FollowUpFormDialog
        open={!!editId}
        onOpenChange={(open) => !open && setEditId(undefined)}
        followUpId={editId}
      />
      <ComposeEmailDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        defaultTo={composeDefaults.to}
        defaultSubject={composeDefaults.subject}
        defaultBody={composeDefaults.body}
        defaultCustomerId={composeDefaults.customerId}
        defaultDealId={composeDefaults.dealId}
      />
    </div>
  );
}
