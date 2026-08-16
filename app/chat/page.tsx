import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import MeetingsList from "@/features/meetings/components/MeetingsList";
import { getMeetingsServer } from "@/features/meetings/api/getMeetingsServer";
import Chat from "@/features/chat/components/Chat";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["meetings"],
    queryFn: getMeetingsServer,
  });

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
            Consultant Chat
          </h1>

          <p className="mt-2 text-sm text-coffee">
            Your meetings on one side, a live line to your consultant on the
            other.
          </p>
        </header>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center">
            <MeetingsList />
            <Chat />
          </div>
        </HydrationBoundary>
      </div>
    </main>
  );
}
