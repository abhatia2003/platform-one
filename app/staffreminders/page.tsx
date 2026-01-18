"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Send,
  Users,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  ChevronDown,
  XCircle,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import Sidebar from "../staff/sidebar";
import { CATEGORIES } from "../staff/constants";

type Event = {
  id: string;
  name: string;
  start: string;
  end: string;
  location: string;
};

type Attendee = {
  id: string;
  bookingId: string;
  name: string;
  email: string;
  role: "PARTICIPANT" | "VOLUNTEER";
  confirmationStatus: "PENDING" | "CONFIRMED" | "DECLINED" | null;
  lastReminderSent: string | null;
};

type ConfirmationStats = {
  confirmed: number;
  declined: number;
  pending: number;
  notSent: number;
};

type AttendeeData = {
  event: Event;
  participants: Attendee[];
  volunteers: Attendee[];
  totalAttendees: number;
  confirmationStats: ConfirmationStats;
};

export default function StaffRemindersPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Event selection
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendeeData, setAttendeeData] = useState<AttendeeData | null>(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Email form
  const [recipientType, setRecipientType] = useState<"all" | "participants" | "volunteers">("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeConfirmationLink, setIncludeConfirmationLink] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check authorization
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "STAFF") {
      router.push("/");
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  // Fetch events
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [isAuthorized]);

  // Fetch attendees when event is selected
  const fetchAttendees = async () => {
    if (!selectedEventId) {
      setAttendeeData(null);
      return;
    }

    setLoadingAttendees(true);
    try {
      const response = await fetch(`/api/reminders?eventId=${selectedEventId}`);
      if (response.ok) {
        const data = await response.json();
        setAttendeeData(data);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [selectedEventId]);

  const handleSendReminder = async () => {
    if (!selectedEventId || !subject.trim() || !message.trim()) {
      setSendResult({
        success: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          subject,
          message,
          recipientType,
          includeConfirmationLink,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          message: data.mock
            ? `Development mode: Would send to ${data.recipients.length} recipient(s)`
            : `Successfully sent emails to ${data.stats.successful} recipient(s)${
                includeConfirmationLink ? " with confirmation links" : ""
              }`,
        });
        // Clear form on success
        setSubject("");
        setMessage("");
        // Refresh attendee data to show updated confirmation status
        fetchAttendees();
      } else {
        setSendResult({
          success: false,
          message: data.error || "Failed to send emails",
        });
      }
    } catch (error: any) {
      setSendResult({
        success: false,
        message: error.message || "An error occurred",
      });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecipientCount = () => {
    if (!attendeeData) return 0;
    if (recipientType === "participants") return attendeeData.participants.length;
    if (recipientType === "volunteers") return attendeeData.volunteers.length;
    return attendeeData.totalAttendees;
  };

  const getStatusBadge = (status: Attendee["confirmationStatus"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
            <HelpCircle className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
            Not Sent
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-slate-900 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={CATEGORIES}
      />

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
              <div>
                <p className="text-xs text-gray-500">Staff / Send Reminders</p>
                <h2 className="text-lg font-bold text-gray-900">
                  Email Reminders & Confirmations
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                Send emails and track confirmations
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Step 1: Select Event */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900">Select Event</h3>
              </div>

              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">-- Select an event --</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {formatDate(event.start)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Event Details & Confirmation Stats */}
              {attendeeData && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">
                          {attendeeData.event.name}
                        </h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(attendeeData.event.start)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {attendeeData.event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Stats */}
                  {attendeeData.confirmationStats && (
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {attendeeData.confirmationStats.confirmed}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">Confirmed</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">
                          {attendeeData.confirmationStats.declined}
                        </p>
                        <p className="text-xs text-red-600 font-semibold">Declined</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-amber-700">
                          {attendeeData.confirmationStats.pending}
                        </p>
                        <p className="text-xs text-amber-600 font-semibold">Pending</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-700">
                          {attendeeData.confirmationStats.notSent}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold">Not Sent</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Select Recipients */}
            {selectedEventId && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Select Recipients
                  </h3>
                </div>

                {loadingAttendees ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading attendees...
                    </p>
                  </div>
                ) : attendeeData ? (
                  <div className="space-y-4">
                    {/* Recipient Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setRecipientType("all")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          recipientType === "all"
                            ? "border-slate-900 bg-slate-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Users className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {attendeeData.totalAttendees}
                        </p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          All Attendees
                        </p>
                      </button>
                      <button
                        onClick={() => setRecipientType("participants")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          recipientType === "participants"
                            ? "border-slate-900 bg-slate-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <UserCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {attendeeData.participants.length}
                        </p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Participants
                        </p>
                      </button>
                      <button
                        onClick={() => setRecipientType("volunteers")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          recipientType === "volunteers"
                            ? "border-slate-900 bg-slate-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {attendeeData.volunteers.length}
                        </p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Volunteers
                        </p>
                      </button>
                    </div>

                    {/* Recipient List with Status */}
                    {getRecipientCount() > 0 && (
                      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Recipients ({getRecipientCount()})
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Role</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(recipientType === "all" || recipientType === "participants") &&
                                attendeeData.participants.map((p) => (
                                  <tr key={p.bookingId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{p.email}</td>
                                    <td className="px-4 py-2">
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                                        Participant
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">{getStatusBadge(p.confirmationStatus)}</td>
                                  </tr>
                                ))}
                              {(recipientType === "all" || recipientType === "volunteers") &&
                                attendeeData.volunteers.map((v) => (
                                  <tr key={v.bookingId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">{v.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{v.email}</td>
                                    <td className="px-4 py-2">
                                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">
                                        Volunteer
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">{getStatusBadge(v.confirmationStatus)}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {getRecipientCount() === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <p>No attendees found for this selection</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3: Compose Email */}
            {selectedEventId && attendeeData && getRecipientCount() > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Compose Email
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Include Confirmation Link Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Include Confirmation Link</p>
                        <p className="text-xs text-gray-600">Recipients can confirm or decline their attendance</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConfirmationLink}
                        onChange={(e) => setIncludeConfirmationLink(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Reminder: Upcoming Event on Saturday"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Event details and {includeConfirmationLink ? "confirmation buttons" : ""} will be added automatically.
                    </p>
                  </div>

                  {/* Quick Templates */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Quick Templates
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSubject(`Reminder: ${attendeeData.event.name}`);
                          setMessage(
                            `This is a friendly reminder about our upcoming event.\n\nPlease confirm your attendance using the button below.\n\nWe look forward to seeing you there!\n\nBest regards,\nThe Platform One Team`
                          );
                          setIncludeConfirmationLink(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        📅 Event Reminder
                      </button>
                      <button
                        onClick={() => {
                          setSubject(
                            `Action Required: Confirm Attendance for ${attendeeData.event.name}`
                          );
                          setMessage(
                            `We need your confirmation for the upcoming event.\n\nPlease click the button below to confirm or decline your attendance.\n\nYour response helps us plan accordingly.\n\nThank you,\nThe Platform One Team`
                          );
                          setIncludeConfirmationLink(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        ✅ Confirmation Request
                      </button>
                      <button
                        onClick={() => {
                          setSubject(`Important Update: ${attendeeData.event.name}`);
                          setMessage(
                            `We have an important update regarding the event.\n\n[Insert your update here]\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nThe Platform One Team`
                          );
                          setIncludeConfirmationLink(false);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        📢 Event Update
                      </button>
                    </div>
                  </div>

                  {/* Result Message */}
                  {sendResult && (
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg ${
                        sendResult.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {sendResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <p
                        className={`text-sm font-medium ${
                          sendResult.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {sendResult.message}
                      </p>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSendReminder}
                    disabled={sending || !subject.trim() || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to {getRecipientCount()} Recipient
                        {getRecipientCount() !== 1 ? "s" : ""}
                        {includeConfirmationLink && " with Confirmation Link"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
