"use client";

import { useMemo, useState } from "react";
import { Contact, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { useCRMStore, usePermissions } from "@/store/CRMStoreProvider";
import { contactService } from "@/services";
import type { Contact as ContactType } from "@/types";
import { toast } from "sonner";

export default function ContactsPage() {
  const { getContacts } = useCRMStore();
  const { canEdit } = usePermissions();
  const contacts = getContacts();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<ContactType | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || c.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage contact relationships across your customer accounts."
        actions={
          canEdit ? (
            <Button variant="accent" onClick={() => { setEditContact(undefined); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          ) : undefined
        }
      />

      <Card className="flex flex-col gap-4 p-4 sm:flex-row">
        <SearchBar placeholder="Search contacts..." value={search} onChange={setSearch} className="flex-1" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="No contacts found"
          description="Try adjusting your search or add a new contact."
          actionLabel={canEdit ? "Add Contact" : undefined}
          onAction={canEdit ? () => setFormOpen(true) : undefined}
        />
      ) : (
        <Card>
          <div className="divide-y md:hidden">
            {filtered.map((contact) => (
              <div key={contact.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                  <StatusBadge status={contact.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="truncate">{contact.email}</p>
                  <p>{contact.phone}</p>
                  <p className="text-muted-foreground">{contact.designation}</p>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditContact(contact); setFormOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => setDeleteId(contact.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.designation}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.owner}</TableCell>
                    <TableCell>{formatDate(contact.lastContact)}</TableCell>
                    <TableCell><StatusBadge status={contact.status} /></TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditContact(contact); setFormOpen(true); }}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(contact.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editContact} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete contact?"
        description="This contact will be removed from your CRM."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) {
            await contactService.deleteContact(deleteId);
            toast.success("Contact deleted successfully");
          }
        }}
      />
    </div>
  );
}
