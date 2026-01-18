import { X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { canUserBookEvent, getTierDisplayName, getTierColorClasses, LoyaltyTier } from "@/lib/tierUtils";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "SELECT" | "MULTISELECT";
  options: string[];
  targetRole: "PARTICIPANT" | "VOLUNTEER";
};

type EventDetail = {
  id: string;
  name: string;
  start: string;
  end: string;
  location: string;
  minTier: string;
  questions: Question[];
  bookings: { userId: string }[];
};

type EventDetailModalProps = {
  isOpen: boolean;
  eventId: string | null;
  userId: string;
  userRole: "PARTICIPANT" | "VOLUNTEER";
  userTier: LoyaltyTier | null;
  onClose: () => void;
  onBookingSuccess: () => void;
  onUnbookSuccess?: () => void;
};

export default function EventDetailModal({
  isOpen,
  eventId,
  userId,
  userRole,
  userTier,
  onClose,
  onBookingSuccess,
  onUnbookSuccess,
}: EventDetailModalProps) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedMultiple, setSelectedMultiple] = useState<
    Record<string, string[]>
  >({});
  const [unbooking, setUnbooking] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventDetails();
    } else {
      // Reset state when modal closes
      setEvent(null);
      setAnswers({});
      setSelectedMultiple({});
      setError(null);
    }
  }, [isOpen, eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/events/${eventId}?userRole=${userRole}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError("Unable to load event details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiselectChange = (questionId: string, option: string) => {
    setSelectedMultiple((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!event) return;

    // Validate all questions are answered
    const unansweredQuestions = event.questions.filter((q) => {
      if (q.type === "MULTISELECT") {
        return !selectedMultiple[q.id] || selectedMultiple[q.id].length === 0;
      }
      return !answers[q.id] || answers[q.id].trim() === "";
    });

    if (unansweredQuestions.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare answers array
      const answersArray = event.questions.map((q) => ({
        questionId: q.id,
        value:
          q.type === "MULTISELECT"
            ? JSON.stringify(selectedMultiple[q.id])
            : answers[q.id],
      }));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventId: event.id,
          roleAtBooking: userRole,
          answers: answersArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Success
      onBookingSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnbook = async () => {
    if (!event) return;

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setUnbooking(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/bookings?userId=${userId}&eventId=${event.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Success
      if (onUnbookSuccess) {
        onUnbookSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking. Please try again.");
      console.error(err);
    } finally {
      setUnbooking(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserAlreadyBooked = event?.bookings?.some(
    (booking) => booking.userId === userId
  );

  // Check tier eligibility (volunteers can book any event)
  const eventMinTier = event?.minTier as LoyaltyTier | undefined;
  const canBook = userRole === "VOLUNTEER" || (eventMinTier ? canUserBookEvent(userTier, eventMinTier) : true);

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border-black border-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">Loading event details...</p>
          </div>
        ) : event ? (
          <div className="space-y-6">
            {/* Event Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-xl font-bold text-gray-900">{event.name}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Start:</span>{" "}
                  {formatDate(event.start)}
                </p>
                <p>
                  <span className="font-semibold">End:</span>{" "}
                  {formatDate(event.end)}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location}
                </p>
                <p>
                  <span className="font-semibold">Minimum Tier:</span>{" "}
                  {event.minTier}
                </p>
              </div>
            </div>

            {/* Tier Restriction Warning */}
            {!canBook && !isUserAlreadyBooked && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Tier Requirement Not Met
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This event requires <span className={`inline-block px-2 py-0.5 rounded font-semibold ${eventMinTier ? getTierColorClasses(eventMinTier) : ''}`}>{eventMinTier ? getTierDisplayName(eventMinTier) : 'Unknown'}</span> tier or higher.
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Your current tier: <span className={`inline-block px-2 py-0.5 rounded font-semibold ${userTier ? getTierColorClasses(userTier) : 'bg-gray-100 text-gray-700'}`}>{userTier ? getTierDisplayName(userTier) : 'None'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Already Booked Message */}
            {isUserAlreadyBooked ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    You have already booked this event!
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Check your bookings page to view your registration details.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Unbook Button */}
                <button
                  onClick={handleUnbook}
                  disabled={unbooking}
                  className="w-full rounded-lg bg-red-500 text-white py-3 text-sm font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {unbooking ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            ) : (
              <>
                {/* Booking Form */}
                {event.questions.length > 0 ? (
                  <div className="space-y-4">
                    <h5 className="text-sm font-bold text-gray-700 uppercase">
                      Registration Form
                    </h5>

                    {event.questions.map((question) => (
                      <div key={question.id}>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                          {question.text}
                        </label>

                        {question.type === "TEXT" && (
                          <input
                            type="text"
                            value={answers[question.id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(question.id, e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter your answer"
                          />
                        )}

                        {question.type === "SELECT" && (
                          <select
                            value={answers[question.id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(question.id, e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select an option</option>
                            {question.options.map((option, idx) => (
                              <option key={idx} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}

                        {question.type === "MULTISELECT" && (
                          <div className="space-y-2">
                            {question.options.map((option, idx) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedMultiple[question.id]?.includes(
                                      option
                                    ) || false
                                  }
                                  onChange={() =>
                                    handleMultiselectChange(question.id, option)
                                  }
                                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      No registration questions for this event.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canBook}
                  className="w-full rounded-lg bg-red-500 text-white py-3 text-sm font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : !canBook ? "Tier Requirement Not Met" : "Book This Event"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">
              {error || "Failed to load event details"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
