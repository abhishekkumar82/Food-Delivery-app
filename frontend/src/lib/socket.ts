import { io, Socket } from "socket.io-client";

// Tier 2: a single shared socket connection to the API's real-time layer.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
