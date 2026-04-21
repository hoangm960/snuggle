"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { useUsers, User } from "@/hooks/useUsers";
import { Search, MoreHorizontal, UserPlus, Loader2, X, Shield, ShieldOff, Trash2 } from "lucide-react";

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
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"visitor" | "admin">("visitor");
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteMessage, setInviteMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [actionMessage, setActionMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const {
		users,
		loading,
		error,
		fetchUsers,
		inviteUser,
		updateUserRole,
		updateUserStatus,
		deleteUser,
	} = useUsers();

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

	const handleFilterRoleChange = (role: string) => {
		setRoleFilter(role);
	};

	const handleInvite = async () => {
		if (!inviteEmail.trim()) {
			setInviteMessage({ type: "error", text: "Please enter an email address" });
			return;
		}
		setInviteLoading(true);
		setInviteMessage(null);
		const result = await inviteUser(inviteEmail.trim(), inviteRole);
		setInviteLoading(false);
		setInviteMessage({ type: result.success ? "success" : "error", text: result.message });
		if (result.success) {
			setTimeout(() => {
				setShowInviteModal(false);
				setInviteEmail("");
				setInviteRole("visitor");
				setInviteMessage(null);
			}, 2000);
		}
	};

	const handleCloseModal = () => {
		setShowInviteModal(false);
		setInviteEmail("");
		setInviteRole("visitor");
		setInviteMessage(null);
	};

	const handleToggleDropdown = (userId: string) => {
		setActiveDropdown(activeDropdown === userId ? null : userId);
	};

	const handleRoleChange = async (userId: string, newRole: "visitor" | "admin") => {
		setActiveDropdown(null);
		const success = await updateUserRole(userId, newRole);
		setActionMessage({
			type: success ? "success" : "error",
			text: success ? "Role updated successfully" : "Failed to update role",
		});
		setTimeout(() => setActionMessage(null), 3000);
	};

	const handleStatusToggle = async (userId: string, currentStatus: "active" | "suspended") => {
		setActiveDropdown(null);
		const newStatus = currentStatus === "active" ? "suspended" : "active";
		const success = await updateUserStatus(userId, newStatus);
		setActionMessage({
			type: success ? "success" : "error",
			text: success ? `User ${newStatus === "active" ? "activated" : "suspended"} successfully` : "Failed to update status",
		});
		setTimeout(() => setActionMessage(null), 3000);
	};

	const handleDeleteClick = (user: User) => {
		setActiveDropdown(null);
		setDeleteTarget(user);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleteLoading(true);
		const result = await deleteUser(deleteTarget.id);
		setDeleteLoading(false);
		if (result.success) {
			setShowDeleteModal(false);
			setDeleteTarget(null);
			fetchUsers({
				search: debouncedSearch || undefined,
				role: roleFilter === "All" ? undefined : roleFilter,
			});
		} else {
			setActionMessage({ type: "error", text: result.message });
		}
		setTimeout(() => setActionMessage(null), 3000);
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setDeleteTarget(null);
	};

	return (
		<>
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
								onClick={() => handleFilterRoleChange(r)}
								className={`px-4 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
							>
								{r === "All" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
							</button>
						))}
					</div>
					<button
						onClick={() => setShowInviteModal(true)}
						className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 whitespace-nowrap"
					>
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
											<td
												colSpan={6}
												className="px-6 py-12 text-center text-muted-foreground"
											>
												No users found
											</td>
										</tr>
									) : (
										users.map((u) => (
											<tr
												key={u.id}
												className="hover:bg-secondary/30 transition-colors"
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<img
															src={
																u.photoURL ||
																`https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || "U")}&background=random`
															}
															alt={u.displayName || "User"}
															className="size-10 rounded-full object-cover"
														/>
														<p className="font-medium text-sm">
															{u.displayName || "No name"}
														</p>
													</div>
												</td>
												<td className="px-6 py-4">
													<span
														className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleColor[u.role]}`}
													>
														{u.role.charAt(0).toUpperCase() +
															u.role.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">
													{u.createdAt
														? new Date(u.createdAt).toLocaleDateString()
														: "-"}
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													{u.email}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center gap-2">
														<div
															className={`size-2 rounded-full ${statusColor[u.accountStatus]}`}
														/>
														<span className="text-xs capitalize">
															{u.accountStatus}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-right relative">
													<button
														onClick={() => handleToggleDropdown(u.id)}
														className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
													>
														<MoreHorizontal className="size-4" />
													</button>
													{activeDropdown === u.id && (
														<div className="absolute right-6 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-10">
															<button
																onClick={() =>
																	handleRoleChange(
																		u.id,
																		u.role === "admin"
																			? "visitor"
																			: "admin"
																	)
																}
																className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
															>
																{u.role === "admin" ? (
																	<>
																		<Shield className="size-4" />
																		<span>Demote to Visitor</span>
																	</>
																) : (
																	<>
																	<Shield className="size-4" />
																		<span>Promote to Admin</span>
																</>
																)}
															</button>
															<button
																onClick={() =>
																	handleStatusToggle(u.id, u.accountStatus)
																}
																className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
															>
																{u.accountStatus === "active" ? (
																	<>
																		<ShieldOff className="size-4" />
																		<span>Suspend User</span>
																	</>
																) : (
																	<>
																		<Shield className="size-4" />
																		<span>Activate User</span>
																</>
																)}
															</button>
															<button
																onClick={() => handleDeleteClick(u)}
																className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 text-destructive"
															>
																<Trash2 className="size-4" />
																<span>Delete User</span>
															</button>
														</div>
													)}
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

			{showInviteModal && (
				<div
					className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={handleCloseModal}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-md bg-card rounded-3xl shadow-soft p-7"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="font-display text-2xl font-semibold">Invite User</h2>
							<button
								onClick={handleCloseModal}
								className="size-9 rounded-full hover:bg-secondary flex items-center justify-center"
							>
								<X className="size-4" />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Email Address
								</label>
								<input
									type="email"
									value={inviteEmail}
									onChange={(e) => setInviteEmail(e.target.value)}
									placeholder="Enter email address"
									className="w-full h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Role</label>
								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setInviteRole("visitor")}
										className={`flex-1 h-11 rounded-2xl text-sm font-medium transition-colors ${inviteRole === "visitor" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
									>
										Visitor
									</button>
									<button
										type="button"
										onClick={() => setInviteRole("admin")}
										className={`flex-1 h-11 rounded-2xl text-sm font-medium transition-colors ${inviteRole === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
									>
										Admin
									</button>
								</div>
							</div>
							{inviteMessage && (
								<div
									className={`px-4 py-3 rounded-lg text-sm ${inviteMessage.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
								>
									{inviteMessage.text}
								</div>
							)}
							<button
								onClick={handleInvite}
								disabled={inviteLoading}
								className="w-full h-11 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{inviteLoading ? <Loader2 className="size-4 animate-spin" /> : null}
								{inviteLoading ? "Sending..." : "Send Invitation"}
							</button>
						</div>
					</div>
				</div>
			)}

			{actionMessage && (
				<div
					className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-sm z-50 ${
						actionMessage.type === "success"
							? "bg-success/10 text-success"
							: "bg-destructive/10 text-destructive"
					}`}
				>
					{actionMessage.text}
				</div>
			)}

			{showDeleteModal && deleteTarget && (
				<div
					className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={handleCloseDeleteModal}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-md bg-card rounded-3xl shadow-soft p-7"
					>
						<div className="flex items-center gap-4 mb-6">
							<div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
								<Trash2 className="size-6 text-destructive" />
							</div>
							<div>
								<h2 className="font-display text-xl font-semibold">
									Delete User
								</h2>
								<p className="text-sm text-muted-foreground">
									This action cannot be undone.
								</p>
							</div>
						</div>
						<div className="bg-secondary/40 rounded-2xl p-4 mb-6">
							<p className="text-sm">
								Are you sure you want to delete{" "}
								<strong className="font-semibold">
									{deleteTarget.displayName || "this user"}
								</strong>
								{" "}({deleteTarget.email})? Their account
								and all associated data will be permanently
								removed.
							</p>
						</div>
						<div className="flex gap-3">
							<button
								onClick={handleCloseDeleteModal}
								className="flex-1 h-11 rounded-2xl border border-border text-sm font-medium hover:bg-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmDelete}
								disabled={deleteLoading}
								className="flex-1 h-11 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{deleteLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								{deleteLoading ? "Deleting..." : "Delete User"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
