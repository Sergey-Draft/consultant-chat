"use client";

import { useQuery } from "@tanstack/react-query";

import { getMeetings } from "../api/getMeetings";

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
      <section className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="h-24 rounded-lg bg-gray-100" />
          <div className="h-24 rounded-lg bg-gray-100" />
          <div className="h-24 rounded-lg bg-gray-100" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full rounded-xl border border-red-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Meetings
          </h2>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Retry
          </button>
        </div>

        <p className="mt-4 text-sm text-red-600">
          Failed to load meetings.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Meetings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your meetings
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3 bg-gray-50 p-4">
        {meetings?.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-gray-900">
                {meeting.title}
              </h3>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  meeting.status === "planned"
                    ? "bg-blue-50 text-blue-700"
                    : meeting.status === "ongoing"
                      ? "bg-green-50 text-green-700"
                      : meeting.status === "completed"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-50 text-red-700"
                }`}
              >
                {meeting.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {meeting.date}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}