"use client";

import React, { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Award,
  MapPin,
  Building2,
  School,
  TrendingUp,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

import BackButton from "@/lib/BackButton";
import Link from "next/link";

/* =========================================================
   HELPERS
========================================================= */

const initials = (f, l) =>
  `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

const AVATAR_COLORS = [
  {
    bg: "bg-gray-100",
    text: "text-[#002C54]",
  },
];

const CITY_COLORS = [
  {
    bg: "bg-gray-100",
    text: "text-[#002C54]",
    bar: "bg-[#002C54]",
  },
];

const CERT_COLORS = [
  {
    bg: "bg-gray-100",
    text: "text-[#002C54]",
    icon: "bg-gray-200",
  },
];

const STREAM_COLORS = [
  "#002C54",
  "#1f2937",
  "#4b5563",
  "#9ca3af",
];

const DONUT_COLORS = {
  working: "#002C54",
  left: "#4b5563",
  null: "#d1d5db",
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const map = {
    working: {
      cls: "bg-[#002C54]/10 text-[#002C54]",
      dot: "bg-[#002C54]",
      label: "Working",
    },

    left: {
      cls: "bg-gray-100 text-gray-700",
      dot: "bg-gray-500",
      label: "Not Working",
    },

    certified: {
      cls: "bg-black text-white",
      dot: "bg-white",
      label: "Certified",
    },
  };

  const s =
    map[status] ?? {
      cls: "bg-gray-100 text-gray-500",
      dot: "bg-gray-400",
      label: "Unknown",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}
      />
      {s.label}
    </span>
  );
}

/* =========================================================
   CARD
========================================================= */

function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-md border border-gray-200 shadow-sm p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({
  icon: Icon,
  children,
}) {
  return (
    <p className="flex items-center gap-2 text-[12px] font-semibold text-[#002C54] uppercase tracking-wide mb-5">
      {Icon && (
        <Icon size={14} />
      )}
      {children}
    </p>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "indigo",
}) {
  const accents = {
    indigo: {
      bg: "bg-[#002C54]/10",
      icon: "text-[#002C54]",
      num: "text-[#002C54]",
    },

    emerald: {
      bg: "bg-gray-100",
      icon: "text-gray-700",
      num: "text-black",
    },

    rose: {
      bg: "bg-gray-100",
      icon: "text-gray-700",
      num: "text-black",
    },

    violet: {
      bg: "bg-black",
      icon: "text-white",
      num: "text-black",
    },

    amber: {
      bg: "bg-gray-100",
      icon: "text-gray-700",
      num: "text-black",
    },
  };

  const a =
    accents[accent] ??
    accents.indigo;

  return (
    <Card className="flex flex-col gap-4">

      <div className="flex items-center justify-between">

        <div
          className={`w-10 h-10 rounded-md ${a.bg} flex items-center justify-center`}
        >
          <Icon
            size={18}
            className={a.icon}
          />
        </div>

      </div>

      <div>

        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <h2
          className={`text-3xl font-bold mt-1 ${a.num}`}
        >
          {value || 0}
        </h2>

        {sub && (
          <p className="text-xs text-gray-500 mt-1">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   TOOLTIP
========================================================= */

function CustomTooltip({
  active,
  payload,
  label,
}) {
  if (
    active &&
    payload &&
    payload.length
  ) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-2">

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="text-sm font-semibold text-black mt-1">
          {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
}

/* =========================================================
   MAIN
========================================================= */

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard =
    async () => {
      try {
        const response =
          await fetch(
            "/api/dashboard"
          );

        const data =
          await response.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#002C54] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const cards =
    dashboardData?.cards ?? {};

  const charts =
    dashboardData?.charts ?? {};

  const recentStudents =
    dashboardData?.recentStudents ??
    [];

  const total =
    cards.totalStudents ?? 0;

  const working =
    charts.employmentStatus?.find(
      (i) => i._id === "working"
    )?.total ?? 0;

  const left =
    charts.employmentStatus?.find(
      (i) => i._id === "left"
    )?.total ?? 0;

  const certified =
    cards.certifiedStudents ?? 0;

  const unknown =
    charts.employmentStatus?.find(
      (i) => i._id === null
    )?.total ?? 0;

  /* =========================================================
     MONTHLY
  ========================================================= */

  const MONTHS = [
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

  const monthMap = {};

  charts.monthlyRegistrations?.forEach(
    (m) => {
      monthMap[m._id.month] =
        m.total;
    }
  );

  const monthlyData =
    MONTHS.map((name, i) => ({
      name,
      value:
        monthMap[i + 1] ?? 0,
    }));

  /* =========================================================
     DONUT
  ========================================================= */

  const donutData = (
    charts.employmentStatus ?? []
  ).map((i) => ({
    name:
      i._id || "fresher",
    value: i.total,
    fill:
      DONUT_COLORS[i._id] ??
      "#d1d5db",
  }));

  const maxStream =
    charts.topStreams?.[0]
      ?.total || 1;

  return (
    <div className="min-h-screen w-full p-5">

      <BackButton />

      <div className="mt-5">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="flex items-start justify-between mb-7">

          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">
              Student Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              GRRAS Institute —
              Live Student Analytics
            </p>
          </div>

          <button className="bg-[#002C54] text-white hover:bg-[#001f3b] px-4 h-10 rounded-md text-sm font-medium transition">
            This Month
          </button>
        </div>

        {/* =========================================================
            STATS
        ========================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">

          <StatCard
            icon={Users}
            label="Total Students"
            value={
              cards.totalStudents
            }
            sub="All students"
            accent="indigo"
          />

          <StatCard
            icon={UserCheck}
            label="Working"
            value={working}
            sub="Currently employed"
            accent="emerald"
          />

          <StatCard
            icon={UserX}
            label="Not Working"
            value={left}
            sub="Left companies"
            accent="rose"
          />

          <StatCard
            icon={BadgeCheck}
            label="Certified"
            value={certified}
            sub="Have certifications"
            accent="violet"
          />

          <StatCard
            icon={GraduationCap}
            label="New Students"
            value={
              cards.newStudents
            }
            sub="This month"
            accent="amber"
          />
        </div>

        {/* =========================================================
            CHARTS
        ========================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* MONTHLY */}

          <Card className="lg:col-span-2">

            <SectionLabel
              icon={TrendingUp}
            >
              Monthly Registrations
            </SectionLabel>

            <div className="h-[280px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={monthlyData}
                >

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#6b7280",
                      fontSize: 11,
                    }}
                  />

                  <YAxis hide />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  >

                    {monthlyData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            entry.value >
                            0
                              ? "#002C54"
                              : "#e5e7eb"
                          }
                        />
                      )
                    )}

                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* DONUT */}

          <Card>

            <SectionLabel
              icon={Users}
            >
              Employment Status
            </SectionLabel>

            <div className="h-[280px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={donutData}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {donutData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            entry.fill
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-3">

              {donutData.map(
                (d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2"
                  >

                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          d.fill,
                      }}
                    />

                    <span className="text-[11px] text-gray-500">
                      {d.name?.toLowerCase() ===
                      "left"
                        ? "Not Working"
                        : d.name?.toLowerCase() ===
                          "fresher"
                        ? "Fresher"
                        : d.name?.toLowerCase() ===
                          "working"
                        ? "Working"
                        : d.name}
                    </span>

                    <span className="text-[11px] font-semibold text-black">
                      {d.value}
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>

        {/* =========================================================
            SMALL CARDS
        ========================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

          {/* STREAMS */}

          <Card>

            <SectionLabel
              icon={School}
            >
              Top Streams
            </SectionLabel>

            <div className="space-y-4">

              {charts.topStreams?.map(
                (
                  stream,
                  i
                ) => (
                  <div
                    key={
                      stream._id
                    }
                  >

                    <div className="flex justify-between mb-1">

                      <span className="text-sm text-gray-700">
                        {
                          stream._id
                        }
                      </span>

                      <span className="text-sm font-semibold text-black">
                        {
                          stream.total
                        }
                      </span>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            (stream.total /
                              maxStream) *
                            100
                          }%`,
                          background:
                            STREAM_COLORS[
                              i %
                                STREAM_COLORS.length
                            ],
                        }}
                      />

                    </div>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* CERTIFICATIONS */}

          <Card>

            <SectionLabel
              icon={Award}
            >
              Top Certifications
            </SectionLabel>

            <div className="space-y-3">

              {charts.topCertifications?.map(
                (
                  cert,
                  i
                ) => {
                  const c =
                    CERT_COLORS[0];

                  return (
                    <div
                      key={
                        cert._id
                      }
                      className={`flex items-center justify-between rounded-md px-4 py-3 ${c.bg}`}
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}
                        >
                          <Award
                            size={
                              15
                            }
                            className={
                              c.text
                            }
                          />
                        </div>

                        <span
                          className={`text-sm font-medium ${c.text}`}
                        >
                          {
                            cert._id
                          }
                        </span>
                      </div>

                      <span
                        className={`text-lg font-bold ${c.text}`}
                      >
                        {
                          cert.total
                        }
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </Card>

          {/* INDUSTRIES */}

          <Card>

            <SectionLabel
              icon={Building2}
            >
              Top Industries
            </SectionLabel>

            <div className="space-y-3">

              {charts.industryStats
                ?.filter(
                  (i) => i._id
                )
                ?.map(
                  (
                    ind,
                    i
                  ) => (
                    <div
                      key={
                        ind._id
                      }
                      className="border border-gray-200 rounded-md px-4 py-3"
                    >

                      <p className="text-sm font-medium text-black">
                        {
                          ind._id
                        }
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Industry
                      </p>

                      <p className="text-2xl font-bold text-[#002C54] mt-3">
                        {
                          ind.total
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
          </Card>

          {/* CITIES */}

          <Card>

            <SectionLabel
              icon={MapPin}
            >
              Top Cities
            </SectionLabel>

            <div className="space-y-3">

              {charts.topCities?.map(
                (
                  city,
                  i
                ) => {
                  const c =
                    CITY_COLORS[0];

                  return (
                    <div
                      key={
                        city._id
                      }
                      className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-3"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg}`}
                        >
                          <MapPin
                            size={
                              15
                            }
                            className={
                              c.text
                            }
                          />
                        </div>

                        <span className="text-sm text-black font-medium">
                          {
                            city._id
                          }
                        </span>
                      </div>

                      <span className="font-bold text-[#002C54]">
                        {
                          city.total
                        }
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        </div>

        {/* =========================================================
            TABLE
        ========================================================= */}

        <Card>

          <div className="flex items-center justify-between mb-5">

            <SectionLabel
              icon={Users}
            >
              Recent Students
            </SectionLabel>

            <Link href={'/students'} className="flex items-center gap-1 text-sm text-[#002C54] font-medium">
              See All
              <ChevronRight
                size={16}
              />
            </Link>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-200">

                  {[
                    "Student",
                    "Course",
                    "Stream",
                    "Location",
                    "Status",
                    "Certification",
                    "Field",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-2 text-[11px] uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>

              </thead>

              <tbody>

                {recentStudents.map(
                  (
                    s,
                    i
                  ) => {
                    const av =
                      AVATAR_COLORS[0];

                    return (
                      <tr
                        key={
                          s._id
                        }
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >

                        {/* STUDENT */}

                        <td className="py-4 px-2">

                          <div className="flex items-center gap-3">

                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${av.bg} ${av.text}`}
                            >
                              {initials(
                                s.firstName,
                                s.lastName
                              )}
                            </div>

                            <div>

                              <p className="text-sm font-medium text-black whitespace-nowrap">
                                {
                                  s.firstName
                                }{" "}
                                {
                                  s.lastName
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  s.email
                                }
                              </p>

                            </div>
                          </div>
                        </td>

                        {/* COURSE */}

                        <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">
                          {
                            s.course
                          }
                        </td>

                        {/* STREAM */}

                        <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">
                          {s
                            ?.education?.[0]
                            ?.stream ||
                            "-"}
                        </td>

                        {/* LOCATION */}

                        <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">
                          {
                            s.location
                              ?.city
                          }
                          ,{" "}
                          {
                            s.location
                              ?.state
                          }
                        </td>

                        {/* STATUS */}

                        <td className="py-4 px-2">
                          <StatusBadge
                            status={
                              s
                                ?.workExperience
                                ?.status
                            }
                          />
                        </td>

                        {/* CERT */}

                        <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">
                          {s
                            ?.certifications?.[0]
                            ?.name ||
                            "-"}
                        </td>

                        {/* FIELD */}

                        <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">
                          {s
                            ?.workExperience
                            ?.field ||
                            "-"}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}