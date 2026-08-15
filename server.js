import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    setTimeout(() => {
      if (ws.readyState === 1) {
        ws.send(message.toString());
      }
    }, 300);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  setTimeout(() => {
    ws.terminate();
  }, 25000 + Math.random() * 10000);
});

console.log("WebSocket server started on ws://localhost:8081");