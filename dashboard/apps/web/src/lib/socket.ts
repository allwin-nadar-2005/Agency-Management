import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId?: string, role?: string): Socket {
  if (!socket) {
    socket = io('http://localhost:4000', {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      query: { userId, role },
    });
  }
  return socket;
}
