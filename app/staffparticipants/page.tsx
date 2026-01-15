import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

const participants = [
  {
    name: "John Doe",
    status: "Active",
    tier: "Gold",
    email: "john.doe@example.com",
  },
  {
    name: "Alice Smith",
    status: "Active",
    tier: "Silver",
    email: "alice.smith@studio.com",
  },
  {
    name: "Sarah Chen",
    status: "Waitlist",
    tier: "Platinum",
    email: "sarah.chen@design.co",
  },
  {
    name: "Mark Brown",
    status: "Paused",
    tier: "Basic",
    email: "mark.brown@lab.com",
  },
];

export default function StaffParticipantsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Staff Portal
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Participant Directory
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Current Participants
              </h2>
              <p className="text-sm text-gray-500">
                Monitor engagement, tiers, and follow-up status.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.email} className="border-t border-gray-100">
                    <td className="py-3 font-semibold text-gray-900">
                      {participant.name}
                    </td>
                    <td className="py-3 text-gray-600">{participant.status}</td>
                    <td className="py-3 text-gray-600">{participant.tier}</td>
                    <td className="py-3 text-gray-600">{participant.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
