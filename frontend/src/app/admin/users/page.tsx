"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { users, User } from "../_lib/mockData";
import { Search, MoreHorizontal, UserPlus } from "lucide-react";

const roleColor: Record<User["role"], string> = {
  Adopter: "bg-primary-soft text-primary-deep",
  Foster: "bg-accent/15 text-accent",
  Donor: "bg-success/15 text-success",
  Volunteer: "bg-warning/15 text-warning",
};

const statusDot: Record<User["status"], string> = {
  Active: "bg-success",
  Pending: "bg-warning",
  Suspended: "bg-destructive",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("All");

  const filtered = users.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = role === "All" || u.role === role;
    return ms && mr;
  });

  return (
    <AdminLayout title="Users" subtitle="Manage adopters, fosters, donors and volunteers.">
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 h-11 rounded-full bg-card border border-border shadow-card text-sm px-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Adopter", "Foster", "Donor", "Volunteer"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${role === r ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 whitespace-nowrap">
          <UserPlus className="size-4" /> Invite User
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/40">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5">Matches</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="size-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">{u.joined}</td>
                  <td className="px-6 py-4 text-sm font-medium tabular-nums">{u.matches}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${statusDot[u.status]}`} />
                      <span className="text-xs">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground">
                      <MoreHorizontal className="size-4" />
                    </button>
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
