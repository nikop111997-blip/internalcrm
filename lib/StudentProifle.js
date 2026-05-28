"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft, Trash2, Pencil, Mail, Phone, Briefcase,
  GraduationCap, MapPin, Building2, CalendarDays,
  Plus, X, Save, ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ──────────────────────────────────────────────
   Tiny reusable field wrapper
────────────────────────────────────────────── */
function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <div className="h-11 rounded-lg bg-[#f7f7f8] mt-1.5 flex items-center px-3 gap-2 border border-transparent focus-within:border-[#002C54]/30 transition">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        {children}
      </div>
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none text-sm text-gray-800"
    />
  );
}

/* ──────────────────────────────────────────────
   Section header with "Add" button
────────────────────────────────────────────── */
function SectionHeader({ title, onAdd, addLabel = "Add" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
        {title}
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 text-xs font-medium text-[#002C54] bg-[#002C54]/8 hover:bg-[#002C54]/15 px-3 py-1.5 rounded-full transition"
      >
        <Plus size={12} />
        {addLabel}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Removable card wrapper
────────────────────────────────────────────── */
function RemovableCard({ onRemove, children, dark }) {
  return (
    <div
      className={`relative p-4 rounded-xl ${dark ? "bg-[#002C54] text-white" : "bg-[#f7f7f8]"} group`}
    >
      <button
        onClick={onRemove}
        className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition ${
          dark ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500"
        }`}
      >
        <X size={12} />
      </button>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Component
────────────────────────────────────────────── */
export default function EmployeeProfile({ id }) {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  /* ── Fetch ── */
  useEffect(() => { fetchEmployee(); }, []);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      if (data.success) setEmployee(data.employee);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  /* ── Generic field updaters ── */
  const set = (field, value) =>
    setEmployee(prev => ({ ...prev, [field]: value }));

  const setNested = (parent, field, value) =>
    setEmployee(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));

  const setLocation = (field, value) => setNested("location", field, value);
  const setWork = (field, value) => setNested("workExperience", field, value);

  /* ── Array helpers ── */
  const updateArrayItem = (key, index, field, value) =>
    setEmployee(prev => {
      const arr = [...(prev[key] ?? [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });

  const removeArrayItem = (key, index) =>
    setEmployee(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== index),
    }));

  const addEducation = () =>
    setEmployee(prev => ({
      ...prev,
      education: [...(prev.education ?? []), { year: "", stream: "" }],
    }));

  const addCertification = () =>
    setEmployee(prev => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), { name: "" }],
    }));



  /* ── Save ── */
  const saveEmployee = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });
      const data = await res.json();
      if (data.success) { setShowSaveModal(false); toast.success("Employee Updated Successfully"); }
    } catch (e) { toast.error(e) }
    finally { setSaving(false); }
  };

  /* ── Delete ── */
  const deleteEmployee = async () => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.push("/students");
    } catch (e) { console.log(e); }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#002C54] rounded-full animate-spin" />
          Loading profile…
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen w-full p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-none">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5">
              Added {new Date(employee.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSaveModal(true)}
            className="h-10 px-5 rounded-lg bg-[#002C54] text-white flex items-center gap-2 text-sm font-medium hover:bg-[#003a6e] transition"
          >
            <Save size={14} />
            Save Changes
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="h-10 px-5 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center gap-2 text-sm font-medium hover:bg-red-100 transition"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_380px] gap-6">

        {/* ═══════════════════════
            LEFT — Basic Info
        ═══════════════════════ */}
        <div className="space-y-5">
          <div className="bg-white rounded-md p-5 shadow-sm space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
              Basic Details
            </p>

            <Field label="First Name">
              <Input value={employee.firstName} onChange={e => set("firstName", e.target.value)} />
            </Field>

            <Field label="Last Name">
              <Input value={employee.lastName} onChange={e => set("lastName", e.target.value)} />
            </Field>

            <Field label="Email Address" icon={<Mail size={14} />}>
              <Input value={employee.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </Field>

            <Field label="Phone Number" icon={<Phone size={14} />}>
              <Input value={employee.mobile} onChange={e => set("mobile", e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </Field>

            <Field label="Course" icon={<GraduationCap size={14} />}>
              <Input value={employee.course} onChange={e => set("course", e.target.value)} placeholder="e.g. Openshift" />
            </Field>
          </div>

          {/* Location */}
          
        </div>

        {/* ═══════════════════════
            CENTER — Education + Certs + Experience
        ═══════════════════════ */}
        <div className="space-y-5">

          {/* Education */}
          <div className="bg-white rounded-md p-5 shadow-sm">
            <SectionHeader title="Education" onAdd={addEducation} addLabel="Add Education" />
            <div className="space-y-3">
              {(employee.education ?? []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No education added yet.</p>
              )}
              {(employee.education ?? []).map((edu, i) => (
                <RemovableCard key={i} onRemove={() => removeArrayItem("education", i)}>
                  <div className="flex items-start gap-3">
                    <GraduationCap size={16} className="text-[#002C54] mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <input
                        value={edu.stream ?? ""}
                        onChange={e => updateArrayItem("education", i, "stream", e.target.value)}
                        placeholder="Degree / Stream (e.g. MBA)"
                        className="w-full bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400"
                      />
                      <div className="flex items-center gap-2">
                        <CalendarDays size={12} className="text-gray-400" />
                        <input
                          value={edu.year ?? ""}
                          onChange={e => updateArrayItem("education", i, "year", e.target.value)}
                          placeholder="Graduation Year"
                          className="bg-transparent outline-none text-xs text-gray-500 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </RemovableCard>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-md p-5 shadow-sm">
            <SectionHeader title="Certifications" onAdd={addCertification} addLabel="Add Certification" />
            <div className="space-y-3">
              {(employee.certifications ?? []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No certifications added yet.</p>
              )}
              {(employee.certifications ?? []).map((cert, i) => (
                <RemovableCard key={i} dark onRemove={() => removeArrayItem("certifications", i)}>
                  <div className="flex items-center gap-3">
                    <Pencil size={14} className="text-white/70 shrink-0" />
                    <input
                      value={cert.name ?? ""}
                      onChange={e => updateArrayItem("certifications", i, "name", e.target.value)}
                      placeholder="Certification name"
                      className="flex-1 bg-transparent outline-none text-sm font-semibold text-white placeholder:font-normal placeholder:text-white/40"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1 ml-6">Certification</p>
                </RemovableCard>
              ))}
            </div>
          </div>
          <div className=" flex gap-5">
          <div className="bg-white rounded-md p-5 shadow-sm space-y-4 w-full">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
              Location
            </p>

            <Field label="City" icon={<MapPin size={14} />}>
              <Input value={employee.location?.city} onChange={e => setLocation("city", e.target.value)} placeholder="City" />
            </Field>

            <Field label="State">
              <Input value={employee.location?.state} onChange={e => setLocation("state", e.target.value)} placeholder="State" />
            </Field>

            <Field label="Country">
              <Input value={employee.location?.country} onChange={e => setLocation("country", e.target.value)} placeholder="Country" />
            </Field>
          </div>
<div className="bg-[#002C54] text-white rounded-md p-5 w-full">
            <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-4">
              Quick Summary
            </p>
            <div className="space-y-3">
              {[
                { label: "Status", value: employee.workExperience?.status },
                { label: "Company", value: employee.workExperience?.companyName || "—" },
                { label: "Role", value: employee.workExperience?.role },
                { label: "Field", value: employee.workExperience?.field },
                { label: "Experience", value: employee.workExperience?.timePeriod ? `${employee.workExperience.timePeriod} yr` : "—" },
                { label: "Location", value: `${employee.location?.city ?? ""}${employee.location?.state ? ", " + employee.location.state : ""}` || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center pb-2.5 border-b border-white/10 last:border-0 last:pb-0">
                  <span className="text-xs text-white/50">{label}</span>
                  <span className="text-sm font-medium text-white capitalize">{value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
         </div>
        </div>

        {/* ═══════════════════════
            RIGHT — Work Experience + Status
        ═══════════════════════ */}
        <div className="space-y-5">

          {/* Primary Work Experience */}
          <div className="bg-white rounded-md p-5 shadow-sm space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
              Primary Work Experience
            </p>

            <Field label="Company Name" icon={<Building2 size={14} />}>
              <Input
                value={employee.workExperience?.companyName}
                onChange={e => setWork("companyName", e.target.value)}
                placeholder="Company name"
              />
            </Field>

            <Field label="Role / Position" icon={<Briefcase size={14} />}>
              <Input
                value={employee.workExperience?.role}
                onChange={e => setWork("role", e.target.value)}
                placeholder="e.g. Product Manager"
              />
            </Field>

            <Field label="Department / Field">
              <Input
                value={employee.workExperience?.field}
                onChange={e => setWork("field", e.target.value)}
                placeholder="e.g. Education & E-learning"
              />
            </Field>

            <Field label="Experience (Years)" icon={<CalendarDays size={14} />}>
              <Input
                value={employee.workExperience?.timePeriod}
                onChange={e => setWork("timePeriod", e.target.value)}
                placeholder="e.g. 2"
              />
            </Field>

            <div>
              <label className="text-xs text-gray-400">Working Status</label>
              <div className="relative mt-1.5">
                <select
                  value={employee.workExperience?.status ?? ""}
                  onChange={e => setWork("status", e.target.value)}
                  className="w-full h-11 rounded-lg bg-[#f7f7f8] px-3 pr-8 text-sm text-gray-800 outline-none appearance-none border border-transparent focus:border-[#002C54]/30 transition"
                >
                  <option value="">Select status</option>
                  <option value="working">Working</option>
                  <option value="not working">Not Working</option>
                  <option value="freelancing">Freelancing</option>
                  <option value="internship">Internship</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Description</label>
              <textarea
                value={employee.workExperience?.description ?? ""}
                onChange={e => setWork("description", e.target.value)}
                rows={4}
                placeholder="Brief description of role, responsibilities…"
                className="w-full mt-1.5 rounded-lg bg-[#f7f7f8] px-3 py-2.5 text-sm text-gray-800 outline-none resize-none border border-transparent focus:border-[#002C54]/30 transition"
              />
            </div>
          </div>

          {/* Summary read-only card */}
          
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white rounded-md p-7 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-black">Delete Employee?</h2>
            <p className="text-gray-500 mt-2 text-sm leading-6">
              This action cannot be undone. The employee profile will be permanently removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-lg bg-gray-100 font-medium text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteEmployee}
                className="flex-1 h-11 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white rounded-md p-7 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#002C54]/10 flex items-center justify-center mb-4">
              <Save size={20} className="text-[#002C54]" />
            </div>
            <h2 className="text-xl font-bold text-black">Save Changes?</h2>
            <p className="text-gray-500 mt-2 text-sm leading-6">
              Do you want to update this employee's profile with the new information?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 h-11 rounded-lg bg-gray-100 font-medium text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEmployee}
                disabled={saving}
                className="flex-1 h-11 rounded-lg bg-[#002C54] text-white font-medium text-sm hover:bg-[#003a6e] transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}