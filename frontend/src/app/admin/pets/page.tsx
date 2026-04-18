"use client";

import { useState } from "react";
import { AdminLayout } from "../_components/AdminLayout";
import { pets, Pet } from "../_lib/mockData";
import { Plus, Upload, Search, MoreVertical, X } from "lucide-react";

const statusColor: Record<Pet["status"], string> = {
  Available: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Adopted: "bg-muted text-muted-foreground",
  Foster: "bg-primary-soft text-primary-deep",
};

function TogglePill({ label }: { label: "Vaccinated" | "Neutered" }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`h-11 rounded-2xl border text-sm font-semibold flex items-center justify-between px-4 transition-colors ${
        on
          ? "bg-primary-soft border-primary text-primary-deep"
          : "bg-card border-input text-muted-foreground"
      }`}
    >
      <span>{on ? label : `Not ${label}`}</span>
      <span className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${on ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
        {on && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default function PetsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("All");

  const filtered = pets.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.breed.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Pets" subtitle="Manage every pet currently under Snuggle's care.">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or breed..."
            className="w-full pl-10 h-11 rounded-full bg-card border border-border shadow-card text-sm px-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Available", "Pending", "Adopted", "Foster"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 h-11 rounded-full text-xs font-semibold transition-colors ${status === s ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="size-4" /> Add Pet
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((pet) => (
          <article key={pet.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all group">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img src={pet.image} alt={pet.name} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${statusColor[pet.status]}`}>
                {pet.status}
              </span>
              <button className="absolute top-3 right-3 size-8 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center hover:bg-card">
                <MoreVertical className="size-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-lg font-semibold">{pet.name}</h3>
                <span className="text-[10px] text-muted-foreground font-mono">{pet.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">{pet.breed} · {pet.age}y · {pet.gender}</p>
              <p className="text-xs text-foreground/70 mt-3 line-clamp-2 leading-relaxed">{pet.description}</p>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Arrived {pet.arrivalDate}</span>
                <button className="text-xs font-semibold text-primary-deep hover:underline">Edit →</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Add Pet Modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ animation: "admin-fade-in 0.2s ease-out" }}
          onClick={() => setShowUpload(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-3xl shadow-soft p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">Add a new pet</h2>
              <button onClick={() => setShowUpload(false)} className="size-9 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary cursor-pointer transition-colors">
                <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop a photo or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG or JPG, up to 5MB</p>
                <input type="file" className="hidden" accept="image/*" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Name" className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Breed" className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Age" type="number" className="h-11 rounded-2xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <select className="h-11 rounded-2xl border border-input bg-card px-3 text-sm">
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <textarea placeholder="Description..." rows={3} className="w-full rounded-2xl border border-input bg-card p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-ring" />
              <div className="grid grid-cols-2 gap-3">
                {(["Vaccinated", "Neutered"] as const).map((label) => (
                  <TogglePill key={label} label={label} />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUpload(false)} className="flex-1 h-11 rounded-full bg-secondary font-semibold text-sm">Cancel</button>
                <button onClick={() => setShowUpload(false)} className="flex-1 h-11 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow">Save Pet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
