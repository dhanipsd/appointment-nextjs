"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, Check } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", duration: "", price: "" });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", duration: "", price: "" });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchServices();
      } else {
        alert("Failed to delete service");
      }
    } catch (err) {
      alert("Failed to delete service");
    }
  };

  const startEdit = (service: any) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description || "",
      duration: String(service.duration),
      price: service.price != null ? String(service.price) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "", duration: "", price: "" });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name,
          description: editForm.description || null,
          duration: Number(editForm.duration),
          price: editForm.price ? Number(editForm.price) : null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchServices();
      } else {
        alert("Failed to update service");
      }
    } catch (err) {
      alert("Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          duration: Number(form.duration),
          price: form.price ? Number(form.price) : null,
        }),
      });
      if (res.ok) {
        setForm({ name: "", description: "", duration: "", price: "" });
        setShowForm(false);
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create service");
      }
    } catch (err) {
      alert("Failed to create service");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
          Book your <span className="text-indigo-600">appointment</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Choose from our premier services and secure your time slot instantly.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading services...</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service: any) => (
            <div key={service.id}>
              {editingId === service.id ? (
                /* Edit Mode */
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-amber-200 flex flex-col h-full min-h-[320px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Edit Service</h3>
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleEdit} className="flex flex-col flex-grow gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Service name *"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                    />
                    <textarea
                      placeholder="Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-gray-900 placeholder-gray-400 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Duration (min) *"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price ($)"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="mt-auto w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              ) : (
                /* View Mode */
                <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 border border-gray-100 flex flex-col h-full group relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <button
                        onClick={() => startEdit(service)}
                        className="p-1.5 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit service"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-500 mt-2 flex-grow">{service.description}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Duration</p>
                      <p className="font-semibold text-gray-900">{service.duration} mins</p>
                    </div>
                    {service.price != null && (
                      <div className="text-right">
                        <p className="text-sm text-gray-400 font-medium">Price</p>
                        <p className="font-semibold text-gray-900">${service.price}</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/book?service=${service.id}`}
                    className="mt-6 block w-full text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Admin: Add Service Card */}
          {isAdmin && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-indigo-400 flex flex-col items-center justify-center h-full min-h-[320px] group cursor-pointer"
            >
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors mb-4">
                <Plus className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                Add Service
              </h3>
              <p className="text-gray-400 mt-1 text-sm">Create a new appointment type</p>
            </button>
          )}

          {/* Admin: Add Service Form */}
          {isAdmin && showForm && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-indigo-200 flex flex-col h-full min-h-[320px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">New Service</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col flex-grow gap-3">
                <input
                  type="text"
                  required
                  placeholder="Service name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-900 placeholder-gray-400 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Duration (min) *"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price ($)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="mt-auto w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Service"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
