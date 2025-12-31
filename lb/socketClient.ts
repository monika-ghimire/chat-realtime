// lb/socketClient.ts
import { io } from "socket.io-client";
 
const SOCKET_HOST_NAME = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
 
export const socket = io(SOCKET_HOST_NAME, {
  autoConnect: true,
});