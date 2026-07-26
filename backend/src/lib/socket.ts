import { Server } from "socket.io";

// Tier 2: a tiny singleton wrapper around the Socket.io server so controllers
// can emit real-time events without importing index.ts (avoids cycles). All
// emit helpers no-op safely if the server hasn't been wired up yet.
let io: Server | null = null;

export const setIO = (server: Server) => {
  io = server;
};

export const getIO = () => io;

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToOrder = (orderId: string, event: string, payload: unknown) => {
  io?.to(`order:${orderId}`).emit(event, payload);
};
