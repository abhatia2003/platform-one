"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Menu } from "lucide-react";
import Sidebar from "../staff/sidebar";
import UserDropdown from "../components/UserDropdown";
import { CATEGORIES } from "../staff/constants";

const events = [
  {
    title: "Staff Orientation",
    time: "9:00 AM - 10:30 AM",
    date: "Tue, Jul 18",
  },
  {
    title: "Volunteer Training",
    time: "11:00 AM - 1:00 PM",
    date: "Wed, Jul 19",
  },
  {
    title: "Operations Sync",
    time: "2:30 PM - 4:00 PM",
    date: "Fri, Jul 21",
  },
];

export default function StaffCalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={CATEGORIES}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Staff Calendar</h1>
            </div>
            <UserDropdown
              userName="Admin"
              userRole="ADMIN"
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <section className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Staff Events
              </h2>
              <p className="text-sm text-gray-500">
                High-priority coordination sessions for the week.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <div
                key={event.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {event.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
      </main>
    </div>
  );
}
