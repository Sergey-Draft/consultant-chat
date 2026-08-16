"use client";

import { useQuery } from "@tanstack/react-query";

import { getMeetings } from "../api/getMeetings";
import type { MeetingStatus } from "@/types/meeting";

const STATUS_LABEL: Record<MeetingStatus, string> = {
  planned: "planned",
  ongoing: "ongoing",
  completed: "completed",
  cancelled: "cancelled",
};

const STATUS_CLASSNAME: Record<MeetingStatus, string> = {
  planned: "border-mustard/40 bg-mustard/15 text-mustard-dark",
  ongoing: "border-sage/40 bg-sage/15 text-sage-dark",
  completed: "border-coffee/30 bg-coffee/10 text-coffee-dark",
  cancelled: "border-bordeaux/40 bg-bordeaux/15 text-bordeaux-dark",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });

  const timePart = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}, ${timePart}`;
}

export default function MeetingsList() {
  const {
    data: meetings,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });

  if (isLoading) {
    return (
      <section className="w-full max-w-md rounded-lg border border-coffee/25 bg-parchment/70 p-5 shadow-sm lg:max-w-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-coffee/15" />
          <div className="h-20 rounded-md bg-coffee/10" />
          <div className="h-20 rounded-md bg-coffee/10" />
          <div className="h-20 rounded-md bg-coffee/10" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full max-w-md rounded-lg border border-bordeaux/40 bg-parchment/70 p-5 shadow-sm lg:max-w-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Meetings</h2>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-coffee/40 px-3 py-2 text-sm font-medium text-coffee transition hover:bg-coffee/10"
          >
            Retry
          </button>
        </div>

        <p className="mt-4 text-sm text-bordeaux-dark">
          Failed to load meetings.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md overflow-hidden rounded-lg border border-coffee/25 bg-parchment/70 shadow-sm lg:max-w-sm">
      <div className="flex items-center justify-between border-b border-dashed border-coffee/30 px-5 py-4">
        <div>
          <h2 className="font-display text-lg text-ink">Meetings</h2>

          <p className="mt-1 text-sm text-coffee">Your meetings</p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border border-coffee/40 px-3 py-2 text-sm font-medium text-coffee transition hover:bg-coffee/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3 p-4">
        {meetings?.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-md border border-coffee/20 bg-cream p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-ink">{meeting.title}</h3>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASSNAME[meeting.status]}`}
              >
                {STATUS_LABEL[meeting.status]}
              </span>
            </div>

            <p className="mt-3 text-sm text-coffee">
              {formatDate(meeting.date)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
