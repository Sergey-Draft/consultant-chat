import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import MeetingsList from "@/features/meetings/components/MeetingsList";
import { getMeetingsServer } from "@/features/meetings/api/getMeetingsServer";
import Chat from "@/features/chat/components/Chat";

export default async function ChatPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["meetings"],
    queryFn: getMeetingsServer,
  });

  return (
    <main>
      <h1>Consultant Chat</h1>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <MeetingsList />
          <Chat />
        </div>
      </HydrationBoundary>
    </main>
  );
}
