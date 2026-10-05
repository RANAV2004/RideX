import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const connectSocket = (userId: string, role: string) => {
  const s = getSocket();
  s.emit("authenticate", { userId, role });
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
