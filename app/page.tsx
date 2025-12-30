"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lb/socketClient";
import ChatForm from "../components/ChatForm";
import ChatMessage from "../components/ChatMessage";

type Message = { sender: string; message: string };

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<
    { username: string; room: string; socketId: string }[]
  >([]);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const [mainRoom, setMainRoom] = useState("");
  const [privateChats, setPrivateChats] = useState<Record<string, Message[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Socket listeners
  useEffect(() => {
    socket.on("active_users", (users) => setActiveUsers(users));

    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("private-message", ({ sender, message }: Message) => {
      // Add message to private chat history
      setPrivateChats((prev) => {
        const chat = prev[sender] || [];
        return { ...prev, [sender]: [...chat, { sender, message }] };
      });

      // If currently chatting with this user, show in chat
      if (sender === privateChatUser) {
        setMessages((prev) => [...prev, { sender, message }]);
      } else {
        // Increment unread count
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

  const handleJoinRoom = () => {
    if (room && userName) {
      socket.emit("join-room", { room, username: userName });
      setJoined(true);
      setMainRoom(room);
    }
  };

  const handlePrivateChat = (targetUser: string) => {
    if (!targetUser) return;

    const privateRoom = [userName, targetUser].sort().join("_");
    socket.emit("join-room", { room: privateRoom, username: userName });

    setRoom(privateRoom);
    setPrivateChatUser(targetUser);

    // Load chat history
    setMessages(privateChats[targetUser] || []);

    // Reset unread count
    setUnreadCounts((prev) => ({ ...prev, [targetUser]: 0 }));
  };

  const handleSendMessage = (message: string) => {
    if (privateChatUser) {
      const targetUser = activeUsers.find(
        (u) => u.username === privateChatUser
      );
      if (!targetUser) return;

      socket.emit("private-message", {
        toSocketId: targetUser.socketId,
        message,
      });

      // Add to local chat
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

  const handleBackToRoom = () => {
    setPrivateChatUser(null);
    setRoom(mainRoom);
    setMessages([]);
  };

  return (
    <div className="flex mt-24 justify-center w-full">
      {!joined ? (
        <div className="flex w-full max-w-md flex-col items-center bg-gray-100 p-6 rounded-lg">
          <h1 className="mb-4 text-2xl font-bold">Join a Room</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="flex gap-4 w-full max-w-6xl">
          {/* Active users sidebar */}
          <div className="w-1/4 bg-gray-100 p-3 rounded-lg">
            <h2 className="font-bold mb-2">Active Users</h2>
            {activeUsers
              .filter((u) => u.username !== userName)
              .map((user) => (
                <div
                  key={user.socketId}
                  onClick={() => handlePrivateChat(user.username)}
                  className="cursor-pointer p-2 hover:bg-blue-200 rounded flex justify-between"
                >
                  <span>{user.username}</span>
                  {unreadCounts[user.username] ? (
                    <span className="text-sm text-white bg-red-500 px-2 rounded">
                      {unreadCounts[user.username]}
                    </span>
                  ) : null}
                </div>
              ))}
          </div>

          {/* Chat area */}
          <div className="w-3/4">
            <h1 className="mb-2 text-xl font-bold">
              {privateChatUser
                ? `Private chat with ${privateChatUser}`
                : `Room: ${room}`}
            </h1>

            {privateChatUser && (
              <button
                onClick={handleBackToRoom}
                className="mb-2 px-3 py-1 text-white bg-blue-400 rounded"
              >
                Back to Room
              </button>
            )}

            <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 rounded-lg">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  sender={msg.sender}
                  message={msg.message}
                  isOwnMessage={msg.sender === userName}
                />
              ))}
            </div>

            <ChatForm onSendMessage={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
