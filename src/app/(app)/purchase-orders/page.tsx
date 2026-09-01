"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { POFormDialog } from "@/components/purchase-orders/po-form-dialog";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCRMStore, usePermissions } from "@/store/CRMStoreProvider";

export default function PurchaseOrdersPage() {
  const { getPurchaseOrders, getCustomers } = useCRMStore();
  const { canEdit } = usePermissions();
  const pos = getPurchaseOrders();
  const customers = getCustomers();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [customer, setCustomer] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = pos.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        po.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || po.status === status;
      const matchesCustomer = customer === "all" || po.customerId === customer;
      return matchesSearch && matchesStatus && matchesCustomer;
    });
    result = [...result].sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount;
      return b.poDate.localeCompare(a.poDate);
    });
    return result;
  }, [pos, search, status, customer, sortBy]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Track and manage customer purchase orders."
        actions={
          canEdit ? (
            <Button variant="accent" onClick={() => setFormOpen(true)}>Upload PO</Button>
          ) : undefined
        }
      />

      <Card className="flex flex-col gap-4 p-4 lg:flex-row">
        <SearchBar placeholder="Search PO number or customer..." value={search} onChange={setSearch} className="flex-1" />
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(["pending", "received", "approved", "processing", "completed", "cancelled"] as const).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={customer} onValueChange={setCustomer}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Customer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">PO Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchase orders available"
          description="Upload a PO document to start tracking."
          actionLabel={canEdit ? "Upload PO" : undefined}
          onAction={canEdit ? () => setFormOpen(true) : undefined}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>PO Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <Link href={`/purchase-orders/${po.id}`} className="font-medium hover:underline">{po.poNumber}</Link>
                    </TableCell>
                    <TableCell>{po.customerName}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{po.dealTitle}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(po.amount)}</TableCell>
                    <TableCell>{formatDate(po.poDate)}</TableCell>
                    <TableCell>{formatDate(po.deliveryDate)}</TableCell>
                    <TableCell><StatusBadge status={po.status} type="po" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <POFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
