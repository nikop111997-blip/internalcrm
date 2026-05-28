"use client";

import BackButton from "@/lib/BackButton";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";

export default function StudentDashboard() {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, working: 0, left: 0, certified: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // API Parameters State
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Expanded Filters State
  const [filters, setFilters] = useState({
    country: "", state: "", city: "", course: "", industry: "",
    experienceStatus: "", role: "", certification: "", stream: "",
    startDate: "", endDate: ""
  });

  // --- API FETCHING ---
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      // Append active filters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/students?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setStats(json.stats);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  // Fetch on mount or when dependencies change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchStudents]);

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      country: "", state: "", city: "", course: "", industry: "",
      experienceStatus: "", role: "", certification: "", stream: "",
      startDate: "", endDate: ""
    });
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  // --- UI COMPONENTS ---
  const StatCard = ({ title, value, percentage, isPositive }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {percentage && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isPositive ? '↑' : '↓'} {percentage}%
          </span>
        )}
      </div>
    </div>
  );

 /* ======================================================
   EXPORT CSV
====================================================== */

const exportCSV = () => {
  if (!data || data.length === 0) {
    alert("No data available");
    return;
  }

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Course",
    "City",
    "Country",
    "Experience Status",
    "Role",
    "Field",
    "Company",
    "Certifications",
    "Created At",
  ];

  const rows = data.map(
    (student) => [
      student.firstName || "",
      student.lastName || "",
      student.email || "",
      student.mobile || "",
      student.course || "",
      student.location?.city || "",
      student.location?.country || "",
      student.workExperience
        ?.status || "Fresher",
      student.workExperience
        ?.role || "",
      student.workExperience
        ?.field || "",
      student.workExperience
        ?.companyName || "",
      student.certifications
        ?.map((c) => c.name)
        .join(", ") || "",
      formatDate(
        student.createdAt
      ),
    ]
  );

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map(
          (item) =>
            `"${String(
              item
            ).replace(
              /"/g,
              '""'
            )}"`
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    `students-${Date.now()}.csv`
  );

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );
};

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans ">
      <BackButton />
      <div className="space-y-6 mt-6 ">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats.totalStudents} />
          <StatCard title="Currently Working" value={stats.working} percentage="12.6" isPositive={true} />
          <StatCard title="Certified Students" value={stats.certified} percentage="7.9" isPositive={true} />
          <StatCard title="Left Roles" value={stats.left} percentage="4.2" isPositive={false} />
        </div>

        {/* Main Dashboard Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#7F56D9] focus:border-[#7F56D9] outline-none transition-shadow"
                />
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1.5 bg-white">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent outline-none text-gray-700"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="firstName">Name</option>
                  <option value="location.city">City</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                  title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>

              {/* Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-[#7F56D9]/10 border-[#7F56D9]/30 text-[#7F56D9]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filters {Object.values(filters).some(x => x !== "") && <span className="w-2 h-2 rounded-full bg-[#7F56D9]"></span>}
              </button>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Export CSV
              </button>
              <Link href={'/add-students'} title="add students" className="flex items-center gap-2 px-4 py-2 bg-[#000] text-white rounded-lg text-sm font-medium hover:bg-[#6941C6] transition-colors shadow-sm">
                + Add Student
              </Link>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="p-5 bg-gray-50/80 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Work Status</label>
                <select name="experienceStatus" value={filters.experienceStatus} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]">
                  <option value="">All Statuses</option>
                  <option value="fresher">Fresher (No Exp)</option>
                  <option value="working">Working</option>
                  <option value="left">Left</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Certification</label>
                <input type="text" name="certification" placeholder="e.g. AWS, React..." value={filters.certification} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Course / Stream</label>
                <div className="flex gap-2">
                  <input type="text" name="course" placeholder="Course" value={filters.course} onChange={handleFilterChange} className="w-1/2 border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
                  <input type="text" name="stream" placeholder="Stream" value={filters.stream} onChange={handleFilterChange} className="w-1/2 border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Location (City)</label>
                <input type="text" name="city" placeholder="City" value={filters.city} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
              </div>

              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Date Joined Range</label>
                <div className="flex gap-2 items-center">
                  <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
                  <span className="text-gray-400">to</span>
                  <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-[#7F56D9]" />
                </div>
              </div>

              <div className="flex items-end lg:col-span-2 justify-end pb-1">
                <button onClick={clearFilters} className="text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors flex items-center">
                  Reset all filters
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold w-16">#</th>
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Course</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Experience</th>
                  <th className="p-4 font-semibold">Ceritification</th>
                  <th className="p-4 font-semibold">Created</th>
                  <th className="p-4 font-semibold">More</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="7" className="p-12 text-center text-gray-500">
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#7F56D9] border-t-transparent rounded-full animate-spin mb-2"></div>
                      Loading data...
                    </div>
                  </td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-gray-500">No students match your criteria.</td></tr>
                ) : (
                  data.map((student, index) => (
                    <tr key={student._id || index} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4 text-sm text-gray-500">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#000]/10 text-[#000] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#000] group-hover:text-white transition-colors">
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student.firstName} {student.lastName}</div>
                            <div className="text-xs text-gray-500">{student.email} {student.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student.course}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {student.location?.city || "-"}, {student.location?.country || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {student.mobile || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <div className="font-medium text-gray-900">{student.workExperience? student.workExperience?.field : "Fresher"}</div>
                        <div className="text-xs text-gray-500">
                          {student.workExperience?.role || <span className="text-blue-600 font-medium">Fresher Entry</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-medium text-gray-900">
  {student.certifications?.length > 0
    ? student.certifications
        .map((cert) => cert.name)
        .join(", ")
    : "No Certification"}
</div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(student.createdAt)}
                      </td>
                      <td className="p-4 text-sm  text-gray-700 whitespace-nowrap">
                        <Link href={`/students/${student._id}`} className="flex gap-1 items-center" >
                        <EyeIcon size={12} /> View more
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600 bg-gray-50/30">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows per page:</span>
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded-md py-1 px-2 bg-white outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>{Math.min((page - 1) * limit + 1, pagination.total)} - {Math.min(page * limit, pagination.total)} of {pagination.total}</span>
              <div className="flex gap-1">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button 
                  disabled={page === pagination.totalPages || pagination.totalPages === 0} 
                  onClick={() => setPage(page + 1)}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}