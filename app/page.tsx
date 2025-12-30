"use client";

import ChatForm from "../components/ChatForm";
import ChatMessage from "../components/ChatMessage";
import { useSocket } from "./hook/useSocket";
import { useState } from "react";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const {
    room,
    joined,
    messages,
    activeUsers,
    privateChatUser,
    unreadCounts,
    typingUsers,
    joinRoom,
    sendMessage,
    startPrivateChat,
    backToMainRoom,
  } = useSocket(userName);

  const otherTypingUsers = typingUsers.filter((u) => u !== userName);

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
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg"
          />
          <button
            onClick={() => joinRoom(roomInput)}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="flex gap-4 w-full max-w-6xl">
          {/* Active Users Sidebar */}
          <div className="w-1/4 bg-gray-100 p-3 rounded-lg">
            <h2 className="font-bold mb-2">Active Users</h2>
            {activeUsers
              .filter((u) => u.username !== userName)
              .map((user) => (
                <div
                  key={user.socketId}
                  onClick={() => startPrivateChat(user.username)}
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

          {/* Chat Area */}
          <div className="w-3/4">
            <h1 className="mb-2 text-xl font-bold">
              {privateChatUser
                ? `Private chat with ${privateChatUser}`
                : `Room: ${room}`}
            </h1>

            {privateChatUser && (
              <button
                onClick={backToMainRoom}
                className="mb-2 px-3 py-1 text-white bg-blue-400 rounded"
              >
                Back to Room
              </button>
            )}

            <div className="h-[500px] overflow-y-auto p-4 mb-2 bg-gray-200 rounded-lg">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  sender={msg.sender}
                  message={msg.message}
                  timestamp={msg.timestamp} 
                  isOwnMessage={msg.sender === userName}
                />
              ))}
              {otherTypingUsers.length > 0 && (
                <div className="text-sm text-gray-500 italic">
                  {otherTypingUsers.join(", ")}{" "}
                  {otherTypingUsers.length > 1 ? "are" : "is"} typing...
                </div>
              )}
            </div>

            <ChatForm onSendMessage={sendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
