"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useCRMStore } from "@/store/CRMStoreProvider";

export default function ReportsPage() {
  const {
    getDashboardMetrics,
    getPipeline,
    getRevenueChartData,
    getTeamPerformance,
    getUsers,
    getDeals,
  } = useCRMStore();

  const [period, setPeriod] = useState("6m");
  const [salesperson, setSalesperson] = useState("all");

  const metrics = getDashboardMetrics();
  const pipeline = getPipeline();
  const revenueChart = getRevenueChartData();
  const teamPerformance = getTeamPerformance();
  const users = getUsers().filter((u) => u.role === "salesperson" || u.role === "sales_manager");
  const deals = getDeals();

  const filteredTeam = salesperson === "all"
    ? teamPerformance
    : teamPerformance.filter((m) => m.name === users.find((u) => u.id === salesperson)?.name);

  const dealsByStage = useMemo(() => {
    const stages = ["new", "qualified", "quotation", "negotiation", "won", "lost"] as const;
    return stages.map((stage) => ({
      stage,
      count: deals.filter((d) => d.stage === stage).length,
      value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0),
    }));
  }, [deals]);

  const achievementData = filteredTeam.map((m) => ({
    name: m.name.split(" ")[0],
    achievement: Math.round((m.revenue / m.target) * 100),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Reports"
        description="Analyze performance, pipeline health, and team metrics."
        actions={
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salesperson} onValueChange={setSalesperson}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Salesperson" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespeople</SelectItem>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatCurrency(metrics.totalSales)} />
        <KpiCard label="Target" value={formatCurrency(metrics.targetAmount)} progress={metrics.achievedPercent} />
        <KpiCard label="Win Rate" value={`${metrics.winRate}%`} />
        <KpiCard label="Avg Deal Value" value={formatCurrency(metrics.avgDealValue)} />
        <KpiCard label="Deals Won" value={String(metrics.wonCount)} />
        <KpiCard label="Deals Lost" value={String(metrics.lostCount)} />
        <KpiCard label="Pending POs" value={String(metrics.pendingPOCount)} />
        <KpiCard label="Follow-up Completion" value={`${metrics.followUpCompletion}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#0B1914" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="target" stroke="#B3E64F" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by Salesperson</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={filteredTeam} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(v) => `₹${v / 100000}L`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#0B1914" radius={[0, 4, 4, 0]} name="Revenue" />
                <Bar dataKey="target" fill="#B3E64F" radius={[0, 4, 4, 0]} name="Target" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pipeline Value by Stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#0B1914" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Deals by Stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dealsByStage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#B3E64F" radius={[6, 6, 0, 0]} name="Deal Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Target Achievement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={achievementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="achievement" fill="#B3E64F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
