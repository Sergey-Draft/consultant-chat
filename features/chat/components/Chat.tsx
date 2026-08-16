"use client";

import { useState } from "react";

import { useChat } from "@/features/chat/hooks/useChat";

export default function Chat() {
  const [text, setText] = useState("");

  const {
    messages,
    isConnected,
    pendingCount,
    reconnectIn,
    activities,
    isSimulatingDisconnect,
    sendMessage,
    retryMessage,
    simulateDisconnect,
  } = useChat();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sendMessage(text);
    setText("");
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-coffee/25 bg-parchment/70 shadow-sm">
      <div className="border-b border-dashed border-coffee/30 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-ink">
              Chat with consultant
            </h2>

            <p className="mt-1 text-sm text-coffee">Real-time connection</p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
              isConnected
                ? "border-sage/40 bg-sage/15 text-sage-dark"
                : "border-bordeaux/40 bg-bordeaux/15 text-bordeaux-dark"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-sage-dark" : "bg-bordeaux"
              }`}
            />

            {isConnected ? "Connected" : "No connection"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-coffee">
          <span>
            Pending: <span className="font-medium text-ink">{pendingCount}</span>
          </span>

          {!isConnected && reconnectIn !== null && (
            <>
              <span className="text-coffee/40">•</span>

              <span>
                Reconnecting in{" "}
                <span className="font-medium text-ink">
                  {(reconnectIn / 1000).toFixed(1)}s
                </span>
              </span>
            </>
          )}
        </div>

        {activities.length > 0 && (
          <div className="mt-4 rounded-md bg-cream px-3 py-2.5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-coffee/70">
              Activity
            </div>

            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="mt-0.5 w-4 shrink-0 text-center">
                    {activity.type === "connected" && "✓"}
                    {activity.type === "disconnected" && "!"}
                    {activity.type === "sent" && "↑"}
                    {activity.type === "queued" && "⋯"}
                    {activity.type === "resent" && "↻"}
                    {activity.type === "retried" && "↻"}
                    {activity.type === "delivered" && "✓"}
                    {activity.type === "error" && "!"}
                  </span>

                  <span className="min-w-0 flex-1 text-coffee">
                    {activity.message}
                  </span>

                  <span className="shrink-0 text-coffee/60">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="min-h-[320px] space-y-3 bg-cream px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-coffee/60">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-bordeaux px-4 py-2.5 text-cream shadow-sm">
                <div className="text-sm">{message.text}</div>

                <div className="mt-1 flex items-center justify-end gap-2 text-xs text-cream/70">
                  {message.status === "pending" && <span>Sending...</span>}

                  {message.status === "sent" && <span>Sent</span>}

                  {message.status === "failed" && (
                    <>
                      <span className="text-mustard">Failed</span>

                      <button
                        type="button"
                        onClick={() => retryMessage(message.id)}
                        className="rounded-md bg-cream/15 px-2 py-0.5 font-medium text-cream transition hover:bg-cream/25"
                      >
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-3 border-t border-coffee/25 bg-parchment/70 p-4"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-md border border-coffee/30 bg-cream px-3 py-2 text-sm text-ink outline-none transition placeholder:text-coffee/50 focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/15"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-md bg-bordeaux px-4 py-2 text-sm font-medium text-cream transition hover:bg-bordeaux-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <div className="border-t border-coffee/20 bg-parchment/70 px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-coffee">
              Developer controls
            </p>

            <p className="mt-0.5 text-xs text-coffee/70">
              Test WebSocket disconnect and retry flow
            </p>
          </div>

          <button
            type="button"
            onClick={simulateDisconnect}
            disabled={!isConnected || isSimulatingDisconnect}
            className="shrink-0 rounded-md border border-coffee/40 px-3 py-1.5 text-xs font-medium text-coffee transition hover:bg-coffee/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSimulatingDisconnect
              ? "Simulating..."
              : "Simulate connection loss"}
          </button>
        </div>
      </div>
    </section>
  );
}
