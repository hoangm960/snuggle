"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface DeleteShelterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	shelter: {
		id: string;
		name: string;
	};
}

export function DeleteShelterModal({
	isOpen,
	onClose,
	onSuccess,
	shelter,
}: DeleteShelterModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleDelete = async () => {
		setError(null);
		setIsSubmitting(true);

		try {
			await api.delete(`/admin/shelters/${shelter.id}/hard`);
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to delete shelter");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
			<div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col">
				<div className="p-6">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
						<AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
					</div>
					<div className="text-center">
						<h2 className="text-lg font-semibold text-gray-900">Delete Shelter</h2>
						<p className="text-sm text-gray-500 mt-2">
							Are you sure you want to permanently delete{" "}
							<strong>{shelter.name}</strong>? This action cannot be undone and will
							remove all associated data.
						</p>
					</div>

					{error && (
						<div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
							{error}
						</div>
					)}
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-center gap-3 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full"
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isSubmitting}
						className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
					>
						{isSubmitting && <Loader2 className="size-4 animate-spin" />}
						{isSubmitting ? "Deleting..." : "Delete Permanently"}
					</button>
				</div>
			</div>
		</div>
	);
}
