"use client";

import React, { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import BackButton from "@/lib/BackButton";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // -------------------------
  // FETCH DASHBOARD
  // -------------------------
  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "/api/dashboard"
      );

      const data = await response.json();

      if (data.success) {
        setDashboardData(data);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // -------------------------
  // LOADING
  // -------------------------
  if (loading) {
    return (
      <div className="p-10">
        Loading Dashboard...
      </div>
    );
  }

  // -------------------------
  // API DATA
  // -------------------------
  const cards = dashboardData?.cards;

  const charts = dashboardData?.charts;

  // -------------------------
  // MONTH CHART DATA
  // -------------------------
  const monthNames = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const kpiData =
    charts?.monthlyRegistrations?.map(
      (item) => ({
        month:
          monthNames[item._id.month],
        value: item.total,
      })
    ) || [];

  // -------------------------
  // EMPLOYMENT STATUS
  // -------------------------
  const working =
    charts?.employmentStatus?.find(
      (item) => item._id === "working"
    )?.total || 0;

  const left =
    charts?.employmentStatus?.find(
      (item) => item._id === "left"
    )?.total || 0;

  const certified =
    cards?.certifiedStudents || 0;

  // -------------------------
  // TOTAL
  // -------------------------
  const total =
    working + left + certified;

  return (
    <div className="min-h-screen p-6 w-full">
      <BackButton className="" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 mt-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* TOP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <DashboardCard
              title="Total Employee"
              value={
                cards?.totalStudents || 0
              }
              growth="+6%"
            />

            <DashboardCard
              title="New Employee"
              value={
                cards?.newStudents || 0
              }
              growth="+12%"
            />

            <DashboardCard
              title="Resigned Employee"
              value={
                cards?.resignedStudents ||
                0
              }
              growth="+2%"
            />

          </div>

          {/* KPI */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-sm font-semibold text-gray-700">
                  KPI Performance
                </h2>

                <div className="mt-4 flex items-end gap-3">

                  <h1 className="text-5xl font-bold text-gray-900">
                    {cards?.totalStudents}
                  </h1>

                  <div className="text-xs font-medium text-emerald-500 mb-2">
                    +24%
                  </div>

                </div>
              </div>

              <button className="border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
                <Calendar size={15} />
                Last Year
              </button>

            </div>

            {/* CHART */}
            <div className="h-[260px] mt-10">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={kpiData}
                >
                  <defs>
                    <linearGradient
                      id="purple"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8B5CF6"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="95%"
                        stopColor="#8B5CF6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9CA3AF",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip />

                  <Area
                    type="stepAfter"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fill="url(#purple)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>

            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TOTAL TIME */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

              <div className="flex justify-between">

                <div>

                  <h2 className="text-sm font-semibold text-gray-700">
                    Student Registrations
                  </h2>

                  <h1 className="text-4xl font-bold mt-4">
                    {
                      cards?.totalStudents
                    }
                  </h1>

                  <div className="text-xs text-emerald-500 font-medium mt-2">
                    Active Applications
                  </div>

                </div>

                <button className="border border-gray-200 rounded-xl px-4 py-2 text-sm">
                  Weekly View
                </button>

              </div>

              {/* LINE CHART */}
              <div className="h-[120px] mt-6">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={kpiData}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-4">

                <span>
                  Latest Registrations
                </span>

                <span>
                  {
                    cards?.newStudents
                  }{" "}
                  New
                </span>

              </div>
            </div>

            {/* EMPLOYMENT */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

              <h2 className="text-sm font-semibold text-gray-700 mb-8">
                Employment Status
              </h2>

              {/* STATUS BAR */}
              <div className="flex h-12 rounded-full overflow-hidden mb-3">

                <div
                  style={{
                    width: `${
                      (left / total) *
                      100
                    }%`,
                  }}
                  className="bg-red-400"
                ></div>

                <div
                  style={{
                    width: `${
                      (certified /
                        total) *
                      100
                    }%`,
                  }}
                  className="bg-green-400"
                ></div>

                <div
                  style={{
                    width: `${
                      (working / total) *
                      100
                    }%`,
                  }}
                  className="bg-violet-400"
                ></div>

              </div>

              <div className="flex justify-between text-xs text-gray-400 mb-8">

                <span>0%</span>

                <span>100%</span>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4">

                <EmploymentBox
                  color="bg-violet-500"
                  label="Working"
                  count={working}
                  percentage={`${Math.round(
                    (working / total) *
                      100
                  )}%`}
                />

                <EmploymentBox
                  color="bg-green-500"
                  label="Certified"
                  count={certified}
                  percentage={`${Math.round(
                    (certified /
                      total) *
                      100
                  )}%`}
                />

                <EmploymentBox
                  color="bg-red-500"
                  label="Left"
                  count={left}
                  percentage={`${Math.round(
                    (left / total) *
                      100
                  )}%`}
                />

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-fit">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-semibold">
              Top Industries
            </h2>

            <button className="border border-gray-200 rounded-xl px-4 py-2 text-sm">
              See All
            </button>

          </div>

          {/* MONTH */}
          <div className="flex justify-between items-center mb-6">

            <button>
              <ChevronLeft size={18} />
            </button>

            <span className="font-medium">
              Industry Stats
            </span>

            <button>
              <ChevronRight size={18} />
            </button>

          </div>

          {/* INDUSTRIES */}
          <div className="space-y-4">

            {charts?.industryStats?.map(
              (industry) => (
                <IndustryCard
                  key={industry._id}
                  title={
                    industry._id ||
                    "Unknown"
                  }
                  count={industry.total}
                />
              )
            )}

          </div>

          {/* TOP STREAMS */}
          <div className="mt-10">

            <h2 className="text-lg font-semibold mb-5">
              Top Streams
            </h2>

            <div className="space-y-4">

              {charts?.topStreams?.map(
                (stream) => (
                  <div
                    key={stream._id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700">
                      {stream._id}
                    </span>

                    <span className="font-semibold">
                      {stream.total}
                    </span>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- */
/* CARD */
/* ------------------------- */

function DashboardCard({
  title,
  value,
  growth,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

      <h3 className="text-sm font-semibold text-gray-700">
        {title}
      </h3>

      <div className="mt-6">

        <h1 className="text-5xl font-bold text-gray-900">
          {value}
        </h1>

        <div className="text-xs text-emerald-500 font-medium mt-3">
          {growth}
        </div>

      </div>
    </div>
  );
}

/* ------------------------- */
/* EMPLOYMENT */
/* ------------------------- */

function EmploymentBox({
  color,
  label,
  count,
  percentage,
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">

        <div
          className={`w-3 h-3 rounded-sm ${color}`}
        ></div>

        <span className="text-sm font-medium">
          {label}
        </span>

      </div>

      <div className="flex items-end gap-2">

        <h2 className="text-3xl font-bold">
          {count}
        </h2>

        <span className="text-xs text-gray-400 mb-1">
          {percentage}
        </span>

      </div>
    </div>
  );
}

/* ------------------------- */
/* INDUSTRY CARD */
/* ------------------------- */

function IndustryCard({
  title,
  count,
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5">

      <div className="flex justify-between items-start">

        <div>

          <h3 className="font-semibold text-gray-900 text-sm">
            {title}
          </h3>

          <p className="text-xs text-gray-400 mt-2">
            Industry Applications
          </p>

        </div>

        <button>
          <MoreHorizontal
            size={18}
          />
        </button>

      </div>

      <div className="mt-4 text-2xl font-bold">
        {count}
      </div>

    </div>
  );
}