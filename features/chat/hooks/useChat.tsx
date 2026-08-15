"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/types/chat";

const WS_URL = "ws://localhost:8081";

const RECONNECT_DELAY = 2000;
const SIMULATED_DISCONNECT_DURATION = 8000;
const MAX_ACTIVITY_ITEMS = 3;

interface WebSocketMessage {
  id: string;
  text: string;
}

export interface ChatActivity {
  id: string;
  type:
    | "connected"
    | "disconnected"
    | "sent"
    | "queued"
    | "resent"
    | "retried"
    | "delivered"
    | "error";
  message: string;
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [reconnectIn, setReconnectIn] = useState<number | null>(null);
  const [activities, setActivities] = useState<ChatActivity[]>([]);
  const [isSimulatingDisconnect, setIsSimulatingDisconnect] =
    useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const reconnectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const simulationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const shouldReconnectRef = useRef(true);

  const pendingQueueRef = useRef<WebSocketMessage[]>([]);

  const addActivity = useCallback(
    (type: ChatActivity["type"], message: string) => {
      const activity: ChatActivity = {
        id: crypto.randomUUID(),
        type,
        message,
        timestamp: Date.now(),
      };

      setActivities((current) =>
        [activity, ...current].slice(0, MAX_ACTIVITY_ITEMS),
      );
    },
    [],
  );

  const updatePendingCount = useCallback(() => {
    setPendingCount(pendingQueueRef.current.length);
  }, []);

  const updateMessageStatus = useCallback(
    (messageId: string, status: ChatMessage["status"]) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status,
              }
            : message,
        ),
      );
    },
    [],
  );

  const flushPendingQueue = useCallback(() => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (pendingQueueRef.current.length === 0) {
      return;
    }

    for (const message of pendingQueueRef.current) {
      updateMessageStatus(message.id, "pending");

      socket.send(JSON.stringify(message));

      addActivity(
        "resent",
        `Message "${message.text}" resent after reconnect`,
      );
    }
  }, [addActivity, updateMessageStatus]);

  const connect = useCallback(
    function connectSocket() {
      if (!shouldReconnectRef.current) {
        return;
      }

      const existingSocket = socketRef.current;

      if (
        existingSocket &&
        (existingSocket.readyState === WebSocket.OPEN ||
          existingSocket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      console.log("Connecting to WebSocket...");

      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");

        setIsConnected(true);
        setReconnectIn(null);

        addActivity("connected", "Connection established");

        if (reconnectIntervalRef.current) {
          clearInterval(reconnectIntervalRef.current);
          reconnectIntervalRef.current = null;
        }

        flushPendingQueue();
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as WebSocketMessage;

        pendingQueueRef.current = pendingQueueRef.current.filter(
          (item) => item.id !== message.id,
        );

        updatePendingCount();

        updateMessageStatus(message.id, "sent");

        addActivity(
          "delivered",
          `Message "${message.text}" delivered`,
        );
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");

        setIsConnected(false);

        addActivity("disconnected", "Connection lost");

        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (
          shouldReconnectRef.current &&
          reconnectTimeoutRef.current === null
        ) {
          setReconnectIn(RECONNECT_DELAY);

          reconnectIntervalRef.current = setInterval(() => {
            setReconnectIn((current) => {
              if (current === null || current <= 100) {
                return 0;
              }

              return current - 100;
            });
          }, 100);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;

            if (reconnectIntervalRef.current) {
              clearInterval(reconnectIntervalRef.current);
              reconnectIntervalRef.current = null;
            }

            setReconnectIn(null);

            connectSocket();
          }, RECONNECT_DELAY);
        }
      };

      socket.onerror = () => {
        console.log("WebSocket error");

        addActivity("error", "Connection error");
      };
    },
    [
      addActivity,
      flushPendingQueue,
      updateMessageStatus,
      updatePendingCount,
    ],
  );

  useEffect(() => {
    shouldReconnectRef.current = true;

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }

      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
        simulationTimeoutRef.current = null;
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText) {
        return;
      }

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        text: trimmedText,
        status: "pending",
        createdAt: Date.now(),
      };

      const wsMessage: WebSocketMessage = {
        id: message.id,
        text: message.text,
      };

      setMessages((current) => [...current, message]);

      pendingQueueRef.current.push(wsMessage);
      updatePendingCount();

      const socket = socketRef.current;

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateMessageStatus(message.id, "failed");

        addActivity(
          "queued",
          `Message "${message.text}" queued — waiting for connection`,
        );

        return;
      }

      socket.send(JSON.stringify(wsMessage));

      addActivity(
        "sent",
        `Message "${message.text}" sent`,
      );
    },
    [
      addActivity,
      updateMessageStatus,
      updatePendingCount,
    ],
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const message = messages.find(
        (item) => item.id === messageId,
      );

      if (!message || message.status !== "failed") {
        return;
      }

      const wsMessage: WebSocketMessage = {
        id: message.id,
        text: message.text,
      };

      const alreadyQueued = pendingQueueRef.current.some(
        (item) => item.id === message.id,
      );

      if (!alreadyQueued) {
        pendingQueueRef.current.push(wsMessage);
        updatePendingCount();
      }

      updateMessageStatus(message.id, "pending");

      const socket = socketRef.current;

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        addActivity(
          "retried",
          `Message "${message.text}" queued for retry`,
        );

        return;
      }

      socket.send(JSON.stringify(wsMessage));

      addActivity(
        "retried",
        `Message "${message.text}" retried`,
      );
    },
    [
      messages,
      addActivity,
      updateMessageStatus,
      updatePendingCount,
    ],
  );

  /**
   * Development/test helper.
   *
   * Simulates a lost connection and keeps the application
   * offline for a few seconds so the retry flow can be demonstrated.
   */
  const simulateDisconnect = useCallback(() => {
    if (isSimulatingDisconnect) {
      return;
    }

    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    setIsSimulatingDisconnect(true);

    addActivity(
      "disconnected",
      "Connection loss simulated for testing",
    );

    socket.close();

    shouldReconnectRef.current = false;

    simulationTimeoutRef.current = setTimeout(() => {
      setIsSimulatingDisconnect(false);

      shouldReconnectRef.current = true;

      addActivity(
        "connected",
        "Reconnecting after simulated disconnect",
      );

      connect();
    }, SIMULATED_DISCONNECT_DURATION);
  }, [
    addActivity,
    connect,
    isSimulatingDisconnect,
  ]);

  return {
    messages,
    isConnected,
    pendingCount,
    reconnectIn,
    activities,
    isSimulatingDisconnect,
    sendMessage,
    retryMessage,
    simulateDisconnect,
  };
}