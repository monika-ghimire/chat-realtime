"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lb/socketClient";

type Message = { sender: string; message: string };
type ActiveUser = { username: string; room: string; socketId: string };

export const useSocket = (userName: string, initialRoom: string = "") => {
  const [room, setRoom] = useState(initialRoom);
  const [mainRoom, setMainRoom] = useState(initialRoom);
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const [privateChats, setPrivateChats] = useState<Record<string, Message[]>>(
    {}
  );
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    socket.on("active_users", (users: ActiveUser[]) => setActiveUsers(users));

    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("private-message", ({ sender, message }: Message) => {
      setPrivateChats((prev) => {
        const chat = prev[sender] || [];
        return { ...prev, [sender]: [...chat, { sender, message }] };
      });

      if (sender === privateChatUser) {
        setMessages((prev) => [...prev, { sender, message }]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1,
        }));
      }
    });

    socket.on("user_joined", (msg: string) =>
      setMessages((prev) => [...prev, { sender: "system", message: msg }])
    );

    return () => {
      socket.off("active_users");
      socket.off("message");
      socket.off("private-message");
      socket.off("user_joined");
    };
  }, [privateChatUser]);

  const joinRoom = (roomName: string) => {
    if (!roomName || !userName) return;

    socket.emit("join-room", { room: roomName, username: userName });
    setRoom(roomName);
    setMainRoom(roomName);
    setJoined(true);
  };

  const sendMessage = (message: string) => {
    if (privateChatUser) {
      const targetUser = activeUsers.find((u) => u.username === privateChatUser);
      if (!targetUser) return;

      socket.emit("private-message", {
        toSocketId: targetUser.socketId,
        message,
      });

      setPrivateChats((prev) => {
        const chat = prev[privateChatUser] || [];
        return {
          ...prev,
          [privateChatUser]: [...chat, { sender: userName, message }],
        };
      });

      setMessages((prev) => [...prev, { sender: userName, message }]);
    } else {
      socket.emit("message", { room, message, sender: userName });
      setMessages((prev) => [...prev, { sender: userName, message }]);
    }
  };

  const startPrivateChat = (targetUser: string) => {
    if (!targetUser) return;

    const privateRoom = [userName, targetUser].sort().join("_");
    socket.emit("join-room", { room: privateRoom, username: userName });

    setRoom(privateRoom);
    setPrivateChatUser(targetUser);
    setMessages(privateChats[targetUser] || []);
    setUnreadCounts((prev) => ({ ...prev, [targetUser]: 0 }));
  };

  const backToMainRoom = () => {
    setPrivateChatUser(null);
    setRoom(mainRoom);
    setMessages([]);
  };

  return {
    room,
    mainRoom,
    joined,
    messages,
    activeUsers,
    privateChatUser,
    privateChats,
    unreadCounts,
    joinRoom,
    sendMessage,
    startPrivateChat,
    backToMainRoom,
  };
};
