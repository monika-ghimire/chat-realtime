"use client";
import React, { useState, useEffect, useRef } from "react";
import { socket } from "@/lb/socketClient"; // import socket

const ChatForm = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Emit "typing" event
    socket.emit("typing");

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing");
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    onSendMessage(message);
    setMessage("");

    socket.emit("stop_typing"); // stop typing after sending message
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
        placeholder="Type your message here..."
      />
      <button
        type="submit"
        className="px-4 py-2 text-white rounded-2xl bg-blue-500"
      >
        Send
      </button>
    </form>
  );
};

export default ChatForm;
