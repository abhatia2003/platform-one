"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PartyPopper,
} from "lucide-react";

type ConfirmationData = {
  id: string;
  token: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  sentAt: string;
  respondedAt: string | null;
  event: {
    id: string;
    name: string;
    start: string;
    end: string;
    location: string;
  };
  user: {
    name: string;
    email: string;
  };
};

export default function ConfirmationPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<"confirm" | "decline" | null>(null);

  useEffect(() => {
    fetchConfirmation();
  }, [token]);

  const fetchConfirmation = async () => {
    try {
      const response = await fetch(`/api/confirm/${token}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to load confirmation");
        return;
      }

      setData(result);
    } catch (err) {
      setError("An error occurred while loading the confirmation");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "confirm" | "decline") => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/confirm/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to submit response");
        return;
      }

      setSubmitted(true);
      setSubmittedAction(action);
      if (data) {
        setData({
          ...data,
          status: action === "confirm" ? "CONFIRMED" : "DECLINED",
          respondedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("An error occurred while submitting your response");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Already responded previously
  if (data.status !== "PENDING" && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              data.status === "CONFIRMED" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {data.status === "CONFIRMED" ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Responded
          </h1>
          <p className="text-gray-600 mb-4">
            You have already {data.status === "CONFIRMED" ? "confirmed" : "declined"} your
            attendance for this event.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900">{data.event.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(data.event.start)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Just submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              submittedAction === "confirm" ? "bg-green-100" : "bg-amber-100"
            }`}
          >
            {submittedAction === "confirm" ? (
              <PartyPopper className="w-10 h-10 text-green-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-amber-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {submittedAction === "confirm" ? "You're All Set!" : "Response Recorded"}
          </h1>
          <p className="text-gray-600 mb-6">
            {submittedAction === "confirm"
              ? "Your attendance has been confirmed. We look forward to seeing you!"
              : "We've noted that you won't be able to attend. Thank you for letting us know."}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900">{data.event.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Calendar className="w-4 h-4" />
              {formatDate(data.event.start)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              {formatTime(data.event.start)} - {formatTime(data.event.end)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              {data.event.location}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending - show confirmation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Confirm Your Attendance
          </h1>
          <p className="text-gray-600 mt-2">
            Hi {data.user.name}, please confirm if you can attend:
          </p>
        </div>

        {/* Event Details */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {data.event.name}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{formatDate(data.event.start)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>
                {formatTime(data.event.start)} - {formatTime(data.event.end)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{data.event.location}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleAction("confirm")}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Yes, I'll Be There!
              </>
            )}
          </button>
          <button
            onClick={() => handleAction("decline")}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Sorry, I Can't Make It
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          This link is unique to you. Please do not share it.
        </p>
      </div>
    </div>
  );
}
