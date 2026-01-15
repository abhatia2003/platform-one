"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  LayoutGrid,
  ClipboardList,
  MessageSquare,
  Users,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  FileDown,
  ShieldCheck,
} from "lucide-react";

type Event = {
  id: number;
  title: string;
  date: number;
  category: "workshops" | "counseling" | "community" | "volunteering";
};

type AttendanceStatus = "Checked In" | "Expected" | "No-show" | "On-site";

type Attendee = {
  id: number;
  name: string;
  email: string;
  tier: "Gold" | "Silver" | "Platinum" | "Basic";
  dietary: string;
  referral: string;
  lastSeen: string;
  status: AttendanceStatus;
};

const events: Event[] = [
  { id: 1, title: "Staff Meeting", date: 6, category: "workshops" },
  { id: 2, title: "Volunteer Training", date: 8, category: "community" },
  { id: 3, title: "Counseling Prep", date: 13, category: "counseling" },
  { id: 4, title: "Service Sync", date: 14, category: "workshops" },
  { id: 5, title: "Outreach Review", date: 16, category: "community" },
  { id: 6, title: "Volunteer Briefing", date: 21, category: "volunteering" },
  { id: 7, title: "Participant Check-in", date: 23, category: "counseling" },
  { id: 8, title: "Staff Orientation", date: 25, category: "workshops" },
  { id: 9, title: "Community Showcase", date: 31, category: "community" },
];

const categories = [
  {
    name: "Workshops",
    color: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-500",
  },
  {
    name: "Counseling",
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-500",
  },
  {
    name: "Community",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
  },
  {
    name: "Volunteering",
    color: "bg-purple-100 text-purple-700",
    dotColor: "bg-purple-500",
  },
];

const attendanceRows: Attendee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    tier: "Gold",
    dietary: "Vegetarian",
    referral: "Social Media Ad",
    lastSeen: "2 hrs ago",
    status: "Checked In",
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice.smith@studio.com",
    tier: "Silver",
    dietary: "None",
    referral: "Friend referral",
    lastSeen: "Yesterday",
    status: "Expected",
  },
  {
    id: 3,
    name: "Sarah Chen",
    email: "sarah.chen@design.co",
    tier: "Platinum",
    dietary: "Gluten-free",
    referral: "Newsletter",
    lastSeen: "10 mins ago",
    status: "On-site",
  },
  {
    id: 4,
    name: "Mark Brown",
    email: "mark.brown@lab.com",
    tier: "Basic",
    dietary: "None",
    referral: "Word of mouth",
    lastSeen: "3 days ago",
    status: "No-show",
  },
  {
    id: 5,
    name: "Riley Lee",
    email: "riley.lee@flow.io",
    tier: "Gold",
    dietary: "Vegan",
    referral: "Conference",
    lastSeen: "Just now",
    status: "Checked In",
  },
  {
    id: 6,
    name: "Emma Wilson",
    email: "emma.wilson@team.org",
    tier: "Basic",
    dietary: "None",
    referral: "LinkedIn",
    lastSeen: "5 hrs ago",
    status: "Expected",
  },
];

const tierStyles = {
  Gold: "bg-amber-100 text-amber-700",
  Silver: "bg-slate-100 text-slate-700",
  Platinum: "bg-indigo-100 text-indigo-700",
  Basic: "bg-gray-100 text-gray-700",
};

const statusStyles = {
  "Checked In": "text-emerald-600",
  Expected: "text-blue-600",
  "No-show": "text-rose-600",
  "On-site": "text-amber-600",
};

export default function StaffPortalPage() {
  const [currentMonth] = useState("July 2025");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceTab, setAttendanceTab] = useState<
    "participants" | "volunteers"
  >("participants");

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const calendarDays = [
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
  ];

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return events.filter((event) => event.date === day);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-black">AdminPanel</span>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold">
              WA
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Walter Admin</div>
              <div className="text-xs text-gray-500 uppercase font-medium">
                Staff
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-bold">Create Event</span>
          </button>
        </div>

        <nav className="flex-1 px-2">
          <Link
            href="/staff"
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg transition-colors mb-1"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
          </Link>
          <Link
            href="/staffcalendar"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Calendar</span>
          </Link>
          <Link
            href="/staffattendance"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-semibold">Attendance</span>
          </Link>
          <Link
            href="/staffparticipants"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <Users className="w-5 h-5" />
            <span className="font-semibold">Participants</span>
          </Link>
          <Link
            href="/staffreports"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Reports</span>
          </Link>

          <div className="mt-8 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="w-full flex items-center gap-3 py-2 px-2"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${category.dotColor}`}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs text-gray-500">Projects / July 2025</p>
                <h2 className="text-lg font-bold text-gray-900">
                  Admin Dashboard Overview
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search staff portal"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">
                  WA
                </span>
                Walter Admin
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Calendar Overview
                  </h3>
                  <p className="text-sm text-gray-500">
                    Track staff activity and event flow.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {currentMonth}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-xs text-gray-400 font-semibold mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 relative">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day.day, day.isCurrentMonth);
                  return (
                    <div
                      key={`${day.day}-${index}`}
                      className={`h-16 rounded-lg border border-gray-100 p-2 text-xs ${
                        day.isCurrentMonth
                          ? "bg-white text-gray-900"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{day.day}</span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {dayEvents.slice(0, 2).map((event) => (
                          <span
                            key={event.id}
                            className="w-2 h-2 rounded-full bg-slate-900"
                          ></span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="hidden lg:block absolute right-10 top-16 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                    Event
                  </div>
                  <h4 className="mt-2 text-lg font-bold text-gray-900">
                    Staff Meeting: Activity Scheduling
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Finalize quarterly layout and align team leads before
                    weekend activities begin.
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>08:30 AM - 01:00 PM</span>
                      <span className="font-semibold">Tue, Jul 18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Participants</span>
                      <span className="font-semibold">28 / 30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Volunteers</span>
                      <span className="font-semibold">8 / 8</span>
                    </div>
                  </div>
                  <button className="mt-5 w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold">
                    Confirm Schedule Updates
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Create New Event
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fill in the details to schedule an activity.
                  </p>
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                  Admin Event Creation
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    General Information
                  </p>
                  <input
                    type="text"
                    placeholder="Event Title"
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Start Date</label>
                    <input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">End Date</label>
                    <input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Location</label>
                    <input
                      type="text"
                      placeholder="Main Hall or Zoom"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Capacity</label>
                    <input
                      type="text"
                      placeholder="50"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Eligibility & Loyalty Tiers
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Bronze", "Silver", "Gold", "Platinum"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-slate-900 hover:text-slate-900"
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold">
                  Create Event
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Attendance Management
                </h3>
                <p className="text-sm text-gray-500">
                  Track check-ins, loyalty tiers, and referrals.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-lg">
                  <FileDown className="w-4 h-4" />
                  Export CSV
                </button>
                <button className="px-3 py-2 text-xs bg-slate-900 text-white rounded-lg">
                  Manual Registration
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => setAttendanceTab("participants")}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  attendanceTab === "participants"
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Participants
              </button>
              <button
                type="button"
                onClick={() => setAttendanceTab("volunteers")}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  attendanceTab === "volunteers"
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Volunteers
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="pb-3">User name</th>
                    <th className="pb-3">Loyalty status</th>
                    <th className="pb-3">Dietary</th>
                    <th className="pb-3">Referral</th>
                    <th className="pb-3">Last seen</th>
                    <th className="pb-3">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="py-3">
                        <div className="font-semibold text-gray-900">
                          {row.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {row.email}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            tierStyles[row.tier]
                          }`}
                        >
                          {row.tier}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{row.dietary}</td>
                      <td className="py-3 text-gray-600">{row.referral}</td>
                      <td className="py-3 text-gray-600">{row.lastSeen}</td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-semibold ${
                            statusStyles[row.status]
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
