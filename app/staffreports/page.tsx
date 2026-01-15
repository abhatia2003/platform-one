import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";

const reports = [
  {
    title: "Weekly Participation",
    detail: "+14% attendance compared to last week.",
  },
  {
    title: "Volunteer Coverage",
    detail: "All shifts filled through Friday.",
  },
  {
    title: "Message Engagement",
    detail: "62% open rate on staff updates.",
  },
];

export default function StaffReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Staff Portal
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Staff Reports
            </h1>
          </div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900"
          >
            Back to dashboard
            <ChevronRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Performance Highlights
              </h2>
              <p className="text-sm text-gray-500">
                Snapshot of operational health and engagement.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {report.title}
                </p>
                <p className="mt-2 text-xs text-gray-500">{report.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
