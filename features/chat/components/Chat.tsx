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
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Chat with consultant
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Real-time connection
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              isConnected
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            {isConnected ? "Connected" : "No connection"}
          </div>
        </div>

        {/* Connection details */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>
            Pending:{" "}
            <span className="font-medium text-gray-700">
              {pendingCount}
            </span>
          </span>

          {!isConnected && reconnectIn !== null && (
            <>
              <span className="text-gray-300">•</span>

              <span>
                Reconnecting in{" "}
                <span className="font-medium text-gray-700">
                  {(reconnectIn / 1000).toFixed(1)}s
                </span>
              </span>
            </>
          )}
        </div>

        {/* Activity */}
        {activities.length > 0 && (
          <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
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

                  <span className="min-w-0 flex-1 text-gray-600">
                    {activity.message}
                  </span>

                  <span className="shrink-0 text-gray-400">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="min-h-[320px] space-y-3 bg-gray-50 px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="flex justify-end"
            >
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white shadow-sm">
                <div className="text-sm">
                  {message.text}
                </div>

                <div className="mt-1 flex items-center justify-end gap-2 text-xs text-blue-100">
                  {message.status === "pending" && (
                    <span>Sending...</span>
                  )}

                  {message.status === "sent" && (
                    <span>Sent</span>
                  )}

                  {message.status === "failed" && (
                    <>
                      <span className="text-red-200">
                        Failed
                      </span>

                      <button
                        type="button"
                        onClick={() => retryMessage(message.id)}
                        className="rounded-md bg-white/15 px-2 py-0.5 font-medium text-white transition hover:bg-white/25"
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

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 border-t border-gray-200 bg-white p-4"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {/* Developer / test controls */}
      <div className="border-t border-gray-100 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Developer controls
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              Test WebSocket disconnect and retry flow
            </p>
          </div>

          <button
            type="button"
            onClick={simulateDisconnect}
            disabled={!isConnected || isSimulatingDisconnect}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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