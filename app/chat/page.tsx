import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import MeetingsList from "@/features/meetings/components/MeetingsList";
import { getMeetings } from "@/features/meetings/api/getMeetings";

export default async function ChatPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });

  return (
    <main>
      <h1>Consultant Chat</h1>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <MeetingsList />
      </HydrationBoundary>
    </main>
  );
}
