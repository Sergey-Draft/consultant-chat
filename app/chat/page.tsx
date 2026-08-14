import { Meeting } from "../../types/meeting";

export default async function ChatPage() {
  const response = await fetch(`${process.env.APP_URL}/api/meetings`);

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  const meetings: Meeting[] = await response.json();

  return (
    <main>
      <h1>Consultant Chat</h1>

      <section>
        <h2>Meetings</h2>

        {meetings.map((meeting) => (
          <article key={meeting.id}>
            <h3>{meeting.title}</h3>
            <p>{meeting.date}</p>
            <p>{meeting.status}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
