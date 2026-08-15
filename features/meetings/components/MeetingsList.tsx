"use client";

import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../api/getMeetings";

export default function MeetingsList() {
  const {
    data: meetings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });

  if (isLoading) {
    return <p>Loading meetings...</p>;
  }

  if (isError) {
    return <p>Failed to load meetings.</p>;
  }

  return (
    <section>
      <div>
        <h2>Meetings</h2>

        <button onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {meetings?.map((meeting) => (
        <article key={meeting.id}>
          <h3>{meeting.title}</h3>
          <p>{meeting.date}</p>
          <p>{meeting.status}</p>
        </article>
      ))}
    </section>
  );
}