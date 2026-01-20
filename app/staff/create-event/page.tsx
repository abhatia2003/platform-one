import { Suspense } from "react";
import CreateEventClient from "./CreateEventClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <CreateEventClient />
    </Suspense>
  );
}