"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import api from "@/lib/api";
import {
	Plus,
	Search,
	Building,
	MoreHorizontal,
	Loader2,
	MapPin,
	Mail,
	Phone,
	Edit,
	Trash2,
	Power,
} from "lucide-react";
import { AddShelterModal } from "./_components/AddShelterModal";
import { EditShelterModal } from "./_components/EditShelterModal";
import { DeleteShelterModal } from "./_components/DeleteShelterModal";

export interface Shelter {
	id: string;
	name: string;
	address: string;
	contactEmail: string;
	phone?: string;
	description?: string;
	status: string;
	adminUserId: string;
	trustScore: number;
}

export default function SheltersPage() {
	const [shelters, setShelters] = useState<Shelter[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState<Shelter | null>(null);
	const [activeDropdown, setActiveDropdown] = useState<{
		id: string;
		top: number;
		right: number;
		triggerTop: number;
	} | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const fetchShelters = async () => {
		try {
			setLoading(true);
			const res = await api.get("/admin/shelters");
			setShelters(res.data.data || []);
		} catch (error) {
			console.error("Failed to fetch shelters:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const handleClickOutside = () => setActiveDropdown(null);
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [activeDropdown]);

	useLayoutEffect(() => {
		if (!activeDropdown || !dropdownRef.current) return;
		if (activeDropdown.top <= activeDropdown.triggerTop) return; // already flipped
		const h = dropdownRef.current.offsetHeight;
		// if it overflows the bottom of the window, render it above the trigger button
		if (activeDropdown.top + h > window.innerHeight) {
			setActiveDropdown((prev) => (prev ? { ...prev, top: prev.triggerTop - h - 4 } : null));
		}
	}, [activeDropdown]);

	const handleToggleStatus = async (shelter: Shelter) => {
		try {
			const newStatus = shelter.status === "active" ? "suspended" : "active";
			if (newStatus === "suspended") {
				await api.delete(`/admin/shelters/${shelter.id}`);
			} else {
				await api.put(`/admin/shelters/${shelter.id}`, { status: newStatus });
			}
			setShelters(
				shelters.map((s) => (s.id === shelter.id ? { ...s, status: newStatus } : s))
			);
			setActiveDropdown(null);
		} catch (error) {
			console.error("Failed to toggle shelter status:", error);
			alert("Failed to toggle status");
		}
	};

	useEffect(() => {
		fetchShelters();
	}, []);

	const filteredShelters = shelters.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.contactEmail.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<AdminLayout title="Shelters" subtitle="Manage animal shelters and rescues">
			<div className="p-6 max-w-7xl mx-auto space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
					<div className="relative w-full sm:w-96">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search shelters..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7AADA1]"
						/>
					</div>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-[#216959] text-white rounded-xl text-sm font-medium hover:bg-[#1a5447] transition-colors"
					>
						<Plus className="size-4" />
						Add Shelter
					</button>
				</div>

				{loading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-[#7AADA1]" />
					</div>
				) : filteredShelters.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
						<Building className="size-12 mx-auto text-gray-300 mb-3" />
						<h3 className="text-lg font-medium text-gray-900">No shelters found</h3>
						<p className="text-gray-500 mt-1">
							{search
								? "Try adjusting your search"
								: "Get started by adding a shelter"}
						</p>
					</div>
				) : (
					<div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-left">
								<thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
									<tr>
										<th className="px-6 py-4">Name</th>
										<th className="px-6 py-4">Contact</th>
										<th className="px-6 py-4">Status</th>
										<th className="px-6 py-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{filteredShelters.map((shelter) => (
										<tr
											key={shelter.id}
											className="hover:bg-gray-50/50 transition-colors"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="size-10 rounded-xl bg-[#E8F4F1] flex items-center justify-center text-[#216959]">
														<Building className="size-5" />
													</div>
													<div>
														<p className="font-medium text-gray-900">
															{shelter.name}
														</p>
														<div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
															<MapPin className="size-3" />
															<span className="truncate max-w-[200px]">
																{shelter.address}
															</span>
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="space-y-1">
													<div className="flex items-center gap-1.5 text-gray-600">
														<Mail className="size-3.5" />
														<span>{shelter.contactEmail}</span>
													</div>
													{shelter.phone && (
														<div className="flex items-center gap-1.5 text-gray-600">
															<Phone className="size-3.5" />
															<span>{shelter.phone}</span>
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
														shelter.status === "active"
															? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
															: "bg-red-50 text-red-700 ring-1 ring-red-600/20"
													}`}
												>
													{shelter.status.charAt(0).toUpperCase() +
														shelter.status.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<button
													onClick={(e) => {
														e.stopPropagation();
														if (activeDropdown?.id === shelter.id) {
															setActiveDropdown(null);
															return;
														}
														const rect =
															e.currentTarget.getBoundingClientRect();
														setActiveDropdown({
															id: shelter.id,
															top: rect.bottom + 4,
															right: window.innerWidth - rect.right,
															triggerTop: rect.top,
														});
													}}
													className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
												>
													<MoreHorizontal className="size-4" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
				{activeDropdown &&
					(() => {
						const shelter = shelters.find((x) => x.id === activeDropdown.id);
						if (!shelter) return null;
						return (
							<div
								ref={dropdownRef}
								style={{
									position: "fixed",
									top: activeDropdown.top,
									right: activeDropdown.right,
									zIndex: 50,
								}}
								className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									onClick={() => {
										setSelectedShelter(shelter);
										setIsEditModalOpen(true);
										setActiveDropdown(null);
									}}
									className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
								>
									<Edit className="size-4 text-gray-400" />
									Edit Shelter
								</button>
								<button
									onClick={() => handleToggleStatus(shelter)}
									className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
										shelter.status === "active"
											? "text-red-600 hover:bg-red-50"
											: "text-green-600 hover:bg-green-50"
									}`}
								>
									{shelter.status === "active" ? (
										<>
											<Power className="size-4" />
											Suspend Shelter
										</>
									) : (
										<>
											<Power className="size-4" />
											Activate Shelter
										</>
									)}
								</button>
								<button
									onClick={() => {
										setShowDeleteModal(shelter);
										setActiveDropdown(null);
									}}
									className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 font-medium"
								>
									<Trash2 className="size-4" />
									Delete Shelter
								</button>
							</div>
						);
					})()}
			</div>

			<AddShelterModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSuccess={() => {
					setIsAddModalOpen(false);
					fetchShelters();
				}}
			/>

			{selectedShelter && (
				<EditShelterModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					shelter={selectedShelter}
					onSuccess={() => {
						setIsEditModalOpen(false);
						fetchShelters();
					}}
				/>
			)}

			{showDeleteModal && (
				<DeleteShelterModal
					isOpen={!!showDeleteModal}
					onClose={() => setShowDeleteModal(null)}
					shelter={showDeleteModal}
					onSuccess={() => {
						setShowDeleteModal(null);
						fetchShelters();
					}}
				/>
			)}
		</AdminLayout>
	);
}
