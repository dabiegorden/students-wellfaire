"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/user-context";

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: Set<string>;
  isOnline: (userId: string) => boolean;
  isSupportOnline: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: new Set(),
  isOnline: () => false,
  isSupportOnline: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [isSupportOnline, setIsSupportOnline] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setOnlineUserIds(new Set());
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io({
      path: "/api/socket",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Re-request presence on every (re)connect so indicators are never stale.
    newSocket.on("connect", () => {
      newSocket.emit("presence:sync");
    });

    newSocket.on("presence:online-users", (userIds: string[]) => {
      setOnlineUserIds(new Set(userIds));
    });

    newSocket.on(
      "presence:update",
      ({ userId, online }: { userId: string; online: boolean }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          if (online) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      },
    );

    newSocket.on(
      "presence:admin-status",
      ({ online }: { online: boolean }) => {
        setIsSupportOnline(online);
      },
    );

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?.id]);

  const isOnline = (userId: string) => onlineUserIds.has(userId);

  return (
    <SocketContext.Provider
      value={{ socket, onlineUserIds, isOnline, isSupportOnline }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
