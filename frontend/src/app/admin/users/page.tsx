"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { useUsers, User } from "@/hooks/useUsers";
import { Search, MoreHorizontal, UserPlus, Loader2 } from "lucide-react";

const roleColor: Record<User["role"], string> = {
	visitor: "bg-primary-soft text-primary-deep",
	admin: "bg-accent/15 text-accent",
};

const statusColor: Record<User["accountStatus"], string> = {
	active: "bg-success",
	suspended: "bg-destructive",
};

export default function UsersPage() {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("All");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const { users, loading, error, fetchUsers } = useUsers();

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		fetchUsers({
			search: debouncedSearch || undefined,
			role: roleFilter === "All" ? undefined : roleFilter,
		});
	}, [debouncedSearch, roleFilter, fetchUsers]);

	const handleRoleChange = (role: string) => {
		setRoleFilter(role);
	};

  return (
		<AdminLayout title="Users" subtitle="Manage visitors and administrators.">
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
					{["All", "visitor", "admin"].map((r) => (
						<button
							key={r}
							onClick={() => handleRoleChange(r)}
							className={`px-4 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
						>
							{r === "All" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
						</button>
					))}
				</div>
				<button className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 whitespace-nowrap">
					<UserPlus className="size-4" /> Invite User
				</button>
			</div>

			{loading && (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			)}

			{error && (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4">
					{error}
				</div>
			)}

			{!loading && !error && (
				<div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead className="bg-secondary/40">
								<tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									<th className="px-6 py-3.5">User</th>
									<th className="px-6 py-3.5">Role</th>
									<th className="px-6 py-3.5">Joined</th>
									<th className="px-6 py-3.5">Email</th>
									<th className="px-6 py-3.5">Status</th>
									<th className="px-6 py-3.5"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{users.length === 0 ? (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
											No users found
										</td>
									</tr>
								) : (
									users.map((u) => (
										<tr key={u.id} className="hover:bg-secondary/30 transition-colors">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<img
														src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || "U")}&background=random`}
														alt={u.displayName || "User"}
														className="size-10 rounded-full object-cover"
													/>
													<p className="font-medium text-sm">{u.displayName || "No name"}</p>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleColor[u.role]}`}>
													{u.role.charAt(0).toUpperCase() + u.role.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">
												{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<div className={`size-2 rounded-full ${statusColor[u.accountStatus]}`} />
													<span className="text-xs capitalize">{u.accountStatus}</span>
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<button className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground">
													<MoreHorizontal className="size-4" />
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
