"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useUsers } from "@/hooks/useUsers";

interface AddShelterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function AddShelterModal({ isOpen, onClose, onSuccess }: AddShelterModalProps) {
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [description, setDescription] = useState("");
	const [adminUserId, setAdminUserId] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { users, fetchUsers, loading: usersLoading } = useUsers();

	useEffect(() => {
		if (isOpen) {
			fetchUsers({ role: "shelter", limit: 100 });
		}
	}, [isOpen, fetchUsers]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await api.post("/admin/shelters", {
				name,
				address,
				contactEmail,
				phone,
				description,
				adminUserId: adminUserId || undefined,
				geoPoint: { _latitude: 0, _longitude: 0 }, // dummy point since there's no map picker here
			});

			// Reset form
			setName("");
			setAddress("");
			setContactEmail("");
			setPhone("");
			setDescription("");
			setAdminUserId("");

			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to create shelter");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
			<div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">Add New Shelter</h2>
						<p className="text-sm text-gray-500 mt-1">
							Create a new shelter and assign an admin.
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="p-6 overflow-y-auto">
					{error && (
						<div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
							{error}
						</div>
					)}

					<form id="add-shelter-form" onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Shelter Name *
							</label>
							<input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1]"
								placeholder="Happy Paws Rescue"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Address *
							</label>
							<input
								type="text"
								required
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1]"
								placeholder="123 Rescue Lane, City, State"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Contact Email *
								</label>
								<input
									type="email"
									required
									value={contactEmail}
									onChange={(e) => setContactEmail(e.target.value)}
									className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1]"
									placeholder="hello@rescue.org"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number
								</label>
								<input
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1]"
									placeholder="(555) 123-4567"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Assign Admin User (Optional)
							</label>
							<select
								value={adminUserId}
								onChange={(e) => setAdminUserId(e.target.value)}
								className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1] bg-white"
								disabled={usersLoading}
							>
								<option value="">-- Select a user --</option>
								{users.map((user) => (
									<option key={user.id} value={user.id}>
										{user.displayName || user.email} ({user.email})
									</option>
								))}
							</select>
							<p className="text-xs text-gray-500 mt-1">
								Select a user with the &quot;shelter&quot; role to manage this
								shelter.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
								className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7AADA1] resize-none"
								placeholder="Tell us about this shelter..."
							/>
						</div>
					</form>
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						form="add-shelter-form"
						disabled={isSubmitting}
						className="px-5 py-2 text-sm font-medium text-white bg-[#216959] rounded-xl hover:bg-[#1a5447] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{isSubmitting && <Loader2 className="size-4 animate-spin" />}
						{isSubmitting ? "Creating..." : "Create Shelter"}
					</button>
				</div>
			</div>
		</div>
	);
}
