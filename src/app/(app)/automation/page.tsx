"use client";

import { useState } from "react";
import { Plus, Workflow, Zap, Trash2, Play, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/utils";
import { useCRMStore, usePermissions } from "@/store/CRMStoreProvider";
import { automationService } from "@/services";
import type { AutomationWorkflow } from "@/types";
import { toast } from "sonner";

export default function AutomationPage() {
  const { getWorkflows } = useCRMStore();
  const { canEdit } = usePermissions();
  const workflows = getWorkflows();

  const [formOpen, setFormOpen] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<AutomationWorkflow | null>(null);
  const [testResults, setTestResults] = useState<string[] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", trigger: "Customer email received" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await automationService.createWorkflow({
      name: form.name,
      description: form.description,
      steps: [
        { type: "trigger", label: form.trigger },
        { type: "action", label: "Classify email" },
        { type: "action", label: "Link to customer" },
        { type: "action", label: "Create follow-up if required" },
      ],
    });
    toast.success("Workflow created");
    setFormOpen(false);
    setForm({ name: "", description: "", trigger: "Customer email received" });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editWorkflow || !form.name.trim()) return;
    await automationService.updateWorkflow(editWorkflow.id, {
      name: form.name,
      description: form.description,
      steps: [
        { type: "trigger", label: form.trigger },
        ...editWorkflow.steps.filter((s) => s.type !== "trigger"),
      ],
    });
    toast.success("Workflow updated");
    setEditWorkflow(null);
  }

  function openEdit(workflow: AutomationWorkflow) {
    const trigger = workflow.steps.find((s) => s.type === "trigger");
    setForm({
      name: workflow.name,
      description: workflow.description,
      trigger: trigger?.label ?? "Customer email received",
    });
    setEditWorkflow(workflow);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Build workflows to automate your sales processes."
        actions={
          canEdit ? (
            <Button variant="accent" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5">
                    <Workflow className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <Badge variant={workflow.active ? "success" : "secondary"} className="mt-1">
                      {workflow.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workflow.steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                    {step.type === "trigger" ? <Zap className="h-3.5 w-3.5 text-warning" /> : <span className="text-xs font-semibold text-muted-foreground">THEN</span>}
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              {workflow.lastRun && (
                <p className="mt-4 text-xs text-muted-foreground">Last run: {formatDateTime(workflow.lastRun)}</p>
              )}
              {canEdit && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={async () => {
                    await automationService.toggleWorkflow(workflow.id);
                    toast.success(workflow.active ? "Workflow deactivated" : "Workflow activated");
                  }}>
                    {workflow.active ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(workflow)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ai" onClick={async () => {
                    const results = await automationService.runWorkflow(workflow.id);
                    setTestResults(results);
                    toast.success("Workflow test completed");
                  }}>
                    <Play className="h-3.5 w-3.5" />
                    Test
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(workflow.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults && (
        <Card className="border-ai/20 bg-purple-50/30">
          <CardContent className="p-5">
            <p className="font-medium">Workflow Test Results</p>
            <ul className="mt-2 space-y-1 text-sm">
              {testResults.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Workflow</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Trigger (WHEN)</Label>
              <Input value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create Workflow</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete workflow?"
        description="This workflow will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) {
            await automationService.deleteWorkflow(deleteId);
            toast.success("Workflow deleted");
          }
        }}
      />

      <Dialog open={!!editWorkflow} onOpenChange={() => setEditWorkflow(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Workflow</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Trigger (WHEN)</Label>
              <Input value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditWorkflow(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
