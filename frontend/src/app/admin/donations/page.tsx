"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { StatCard } from "../_components/StatCard";
import { donations, donationTrend, donationByCategory, donationByType, Donation } from "../_lib/mockData";
import { HeartHandshake, TrendingUp, Users, Repeat2, Download, Search } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const typeBadge: Record<Donation["type"], string> = {
  "One-time": "bg-accent/15 text-accent",
  Monthly: "bg-primary-soft text-primary-deep",
  Annual: "bg-success/15 text-success",
};

const statusDot: Record<Donation["status"], string> = {
  Completed: "bg-success",
  Pending: "bg-warning",
  Refunded: "bg-destructive",
};

const statusText: Record<Donation["status"], string> = {
  Completed: "text-success",
  Pending: "text-warning",
  Refunded: "text-destructive",
};

const tooltipStyle = {
  background: "hsl(0 0% 100%)",
  border: "1px solid hsl(30 25% 88%)",
  borderRadius: "12px",
  fontSize: "12px",
};

const totalRaised = donations.filter(d => d.status === "Completed").reduce((s, d) => s + d.amount, 0);
const thisMonth = donations.filter(d => d.date.startsWith("2025-12") && d.status === "Completed").reduce((s, d) => s + d.amount, 0);
const avgDonation = Math.round(totalRaised / donations.filter(d => d.status === "Completed").length);
const donorCount = new Set(donations.map(d => d.donor)).size;

export default function DonationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = donations.filter((d) => {
    const ms = d.donor.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "All" || d.type === typeFilter;
    return ms && mt;
  });

  return (
    <AdminLayout title="Donations" subtitle="Track contributions and financial support for Snuggle's mission.">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Raised" value={`$${(totalRaised / 1000).toFixed(1)}K`} icon={HeartHandshake} trend={{ value: "12.4%", up: true }} iconBg="primary" highlight />
        <StatCard label="This Month" value={`$${thisMonth.toLocaleString()}`} icon={TrendingUp} trend={{ value: "8.1%", up: true }} iconBg="warm" />
        <StatCard label="Avg. Donation" value={`$${avgDonation}`} icon={Repeat2} trend={{ value: "3.2%", up: true }} iconBg="soft" />
        <StatCard label="Total Donors" value={donorCount.toString()} icon={Users} trend={{ value: "5.0%", up: true }} iconBg="muted" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Donation trend line chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-semibold">Donation Trend</h3>
              <p className="text-xs text-muted-foreground">Year over year comparison</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full" style={{ background: "hsl(170 22% 58%)" }} /> 2025
              </span>
              <span className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full" style={{ background: "hsl(24 50% 58%)" }} /> 2024
              </span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 25% 88%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Line type="monotone" dataKey="current" name="2025" stroke="hsl(170 22% 58%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(170 22% 58%)" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="previous" name="2024" stroke="hsl(24 50% 58%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By category donut */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-2">By Category</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donationByCategory} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {donationByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {donationByCategory.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
                <span className="text-xs font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked bar by type */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Donations by Type</h3>
            <p className="text-xs text-muted-foreground">Monthly breakdown — one-time, recurring &amp; annual</p>
          </div>
          <button className="px-4 py-2 rounded-full text-xs font-semibold bg-primary-soft text-primary-deep hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5">
            <Download className="size-3.5" /> Export
          </button>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={donationByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 25% 88%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(24 15% 45%)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <Bar dataKey="One-time" stackId="a" fill="hsl(170 22% 58%)" />
              <Bar dataKey="Monthly" stackId="a" fill="hsl(24 50% 58%)" />
              <Bar dataKey="Annual" stackId="a" fill="hsl(145 35% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donations table */}
      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent Donations</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search donor or ID..."
                  className="pl-8 h-9 rounded-full bg-secondary border-0 text-xs w-44 outline-none focus:ring-2 focus:ring-ring px-3"
                />
              </div>
              {(["All", "One-time", "Monthly", "Annual"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 h-9 rounded-full text-xs font-semibold transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/40">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">Donor</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={d.avatar} alt={d.donor} className="size-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-sm">{d.donor}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-display font-semibold text-sm">${d.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${typeBadge[d.type]}`}>{d.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{d.category}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">{d.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${statusDot[d.status]}`} />
                      <span className={`text-xs font-medium ${statusText[d.status]}`}>{d.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
