"use client";

import { useState } from "react";
import ChatForm from "./components/ChatForm";
import Image from "next/image";
import ChatMessage from "./components/ChatMessage";

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [userName, setUserName] = useState("");

  const handleSendMessage = (message: string) => {
    console.log(message);
  };

  const handleJoinRoom =()=> {
    setJoined(true);
  }
  return (
    <>
      <div className="flex mt-24 justify-center w-full">
        {!joined ? (
          <div className="flex w-full max-x3xl flex-col items-center">
            <h1 className="mb-4 text-2xl font-bold"> Join a Room</h1>
            <input
              type="text"
              placeholder="Enter Your Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Enter room name"
              value={room}
              onChange={(e) => setUserName(e.target.value)}
              className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
            />

            <button
              onClick={handleJoinRoom}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg"
            >
              Join Room
            </button>
          </div>
        ) : (
          <div className="w-full mxa-w-3xl mx-auto">
            <h1 className="mb-4 text-2xl font-bold">Room: 1</h1>
            <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-1 rounded-lg">
              {messages.map((mgs, index) => (
                <ChatMessage
                  key={index}
                  sender={mgs.sender}
                  message={mgs.message}
                  isOwnMessage={mgs.sender === userName}
                />
              ))}
            </div>
            <ChatForm onSendMessage={handleSendMessage} />
          </div>
        )}
      </div>
    </>
  );
}
