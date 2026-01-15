"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  Plus,
  LayoutGrid,
  Calendar,
  MessageSquare,
  ChevronDown,
  X,
  MapPin,
  Clock,
  ChevronRight as ArrowRight,
} from "lucide-react";

type Event = {
  id: number;
  title: string;
  date: number;
  start: Date;
  end: Date;
  location: string;
  createdBy: string;
  category: "workshops" | "counseling" | "community" | "volunteering";
};

const events: Event[] = [
  {
    id: 1,
    title: "Call with Coord.",
    date: 6,
    start: new Date(2025, 0, 6, 10, 0),
    end: new Date(2025, 0, 6, 11, 30),
    location: "Conference Room A",
    createdBy: "Sarah Johnson",
    category: "workshops",
  },
  {
    id: 2,
    title: "Community Park",
    date: 8,
    start: new Date(2025, 0, 8, 14, 0),
    end: new Date(2025, 0, 8, 16, 0),
    location: "Central Park",
    createdBy: "Michael Chen",
    category: "community",
  },
  {
    id: 3,
    title: "Counseling Session",
    date: 13,
    start: new Date(2025, 0, 13, 9, 0),
    end: new Date(2025, 0, 13, 10, 30),
    location: "Room 203",
    createdBy: "Dr. Emily Roberts",
    category: "counseling",
  },
  {
    id: 4,
    title: "Orientation Hub",
    date: 14,
    start: new Date(2025, 0, 14, 13, 0),
    end: new Date(2025, 0, 14, 15, 0),
    location: "Main Hall",
    createdBy: "David Martinez",
    category: "workshops",
  },
  {
    id: 5,
    title: "Layout Review",
    date: 16,
    start: new Date(2025, 0, 16, 11, 0),
    end: new Date(2025, 0, 16, 12, 30),
    location: "Design Studio",
    createdBy: "Alex Kim",
    category: "workshops",
  },
  {
    id: 6,
    title: "Service Layout",
    date: 21,
    start: new Date(2025, 0, 21, 15, 0),
    end: new Date(2025, 0, 21, 17, 0),
    location: "Community Center",
    createdBy: "Jessica Lee",
    category: "community",
  },
  {
    id: 7,
    title: "Participant Orientation",
    date: 23,
    start: new Date(2025, 0, 23, 9, 30),
    end: new Date(2025, 0, 23, 11, 0),
    location: "Training Room B",
    createdBy: "Dr. Emily Roberts",
    category: "counseling",
  },
  {
    id: 8,
    title: "Volunteering",
    date: 23,
    start: new Date(2025, 0, 23, 14, 0),
    end: new Date(2025, 0, 23, 17, 0),
    location: "Local Food Bank",
    createdBy: "Maria Garcia",
    category: "volunteering",
  },
  {
    id: 9,
    title: "Weekend Workshop",
    date: 25,
    start: new Date(2025, 0, 25, 10, 0),
    end: new Date(2025, 0, 25, 14, 0),
    location: "Workshop Space",
    createdBy: "Sarah Johnson",
    category: "workshops",
  },
  {
    id: 10,
    title: "Mentorship Call",
    date: 28,
    start: new Date(2025, 0, 28, 16, 0),
    end: new Date(2025, 0, 28, 17, 0),
    location: "Virtual (Zoom)",
    createdBy: "James Wilson",
    category: "counseling",
  },
  {
    id: 11,
    title: "Staff Meeting",
    date: 31,
    start: new Date(2025, 0, 31, 13, 0),
    end: new Date(2025, 0, 31, 14, 30),
    location: "Executive Boardroom",
    createdBy: "Rachel Thompson",
    category: "community",
  },
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

const categoryStyles = {
  workshops: "bg-orange-100 text-orange-700 border-orange-200",
  counseling: "bg-blue-100 text-blue-700 border-blue-200",
  community: "bg-green-100 text-green-700 border-green-200",
  volunteering: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function Home() {
  const router = useRouter();

  const [currentMonth] = useState("January 2025");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [caregivers, setCaregivers] = useState(0);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleBookingsClick = () => {
    router.push("/bookings");
  };

  const showEventPopup = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setMeetingPoint("");
    setCaregivers(0);
    setAdditionalNotes("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSubmitApplication = () => {
    // Handle form submission
    console.log({
      event: selectedEvent,
      meetingPoint,
      caregivers,
      additionalNotes,
    });
    closeModal();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // January 2025 calendar data (starting with December 30, 2024 to fill the grid)
  const calendarDays = [
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
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
  ];

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return events.filter((event) => event.date === day);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <div
            className="flex items-center gap-2"
            onClick={() => {
              router.push("/");
            }}
          >
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-black">PlatformOne</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Walter Sullivan</div>
              <div className="text-xs text-gray-500 uppercase font-medium">
                Participant
              </div>
            </div>
          </div>
        </div>

        {/* New Request Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-bold">New Request</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <button
            onClick={handleBookingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="font-semibold">Bookings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg transition-colors mb-1">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Calendar</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Messages</span>
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              12
            </span>
          </button>

          {/* My Bookings */}
          <div className="mt-6 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              My Bookings
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Booked</span>
                <span className="font-bold">14 hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold">2 events</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${category.dotColor}`}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">{currentMonth}</h1>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg">
                TODAY
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-semibold uppercase text-xs tracking-wide">
                  Unity Hub
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {daysOfWeek.map((day, index) => {
                const isWeekend = day === "SAT" || day === "SUN";
                return (
                  <div
                    key={index}
                    className={`px-4 py-3 text-center text-xs font-bold uppercase ${
                      isWeekend ? "text-orange-500" : "text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayData, index) => {
                const dayEvents = getEventsForDay(
                  dayData.day,
                  dayData.isCurrentMonth
                );

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-100 p-3 transition-colors ${
                      !dayData.isCurrentMonth ? "bg-gray-50" : ""
                    } hover:bg-red-50 `}
                  >
                    <div
                      className={`text-base font-bold mb-2 ${
                        dayData.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded border ${
                            categoryStyles[event.category]
                          } font-semibold truncate cursor-pointer hover:shadow-sm transition-shadow`}
                          onClick={(e) => {
                            e.stopPropagation();
                            showEventPopup(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    selectedEvent.category === "workshops"
                      ? "text-orange-600"
                      : selectedEvent.category === "counseling"
                      ? "text-blue-600"
                      : selectedEvent.category === "community"
                      ? "text-green-600"
                      : "text-purple-600"
                  }`}
                >
                  {selectedEvent.category}
                </span>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedEvent.title}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatTime(selectedEvent.start)} -{" "}
                    {formatTime(selectedEvent.end)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {selectedEvent.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Meeting Point Selection */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Meeting Point Selection
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="radio"
                      name="meetingPoint"
                      value="harbourfront"
                      checked={meetingPoint === "harbourfront"}
                      onChange={(e) => setMeetingPoint(e.target.value)}
                      className="w-4 h-4 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Harbourfront MRT Station
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="radio"
                      name="meetingPoint"
                      value="vivocity"
                      checked={meetingPoint === "vivocity"}
                      onChange={(e) => setMeetingPoint(e.target.value)}
                      className="w-4 h-4 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Directly at VivoCity Entry
                    </span>
                  </label>
                </div>
              </div>

              {/* Caregivers Attending */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Caregivers Attending
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, "3+"].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setCaregivers(typeof num === "number" ? num : 3)
                      }
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                        caregivers === (typeof num === "number" ? num : 3)
                          ? "bg-red-100 text-red-700 border-2 border-red-300"
                          : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Additional Notes
                </h3>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any special requirements..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none resize-none text-sm"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitApplication}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                Submit Application
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Event Info Footer */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created by{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedEvent.createdBy}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
