"use client";
import React, { useState, useRef, useEffect } from "react";
import { socket } from "@/lb/socketClient";
import Picker, { EmojiClickData } from "emoji-picker-react";

interface ChatFormProps {
  onSendMessage: (message: string) => void;
}

const ChatForm: React.FC<ChatFormProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    socket.emit("typing");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing");
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage("");
    socket.emit("stop_typing");
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      {showEmoji && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-2 z-10"
          style={{ width: "300px" }}
        >
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none"
          placeholder="Type your message..."
        />

        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="px-2 py-2 bg-gray-100 rounded  hover:rounded-full  cursor-pointer transition-all "
        >
          👋🏼
        </button>

        <button
          type="submit"
          className="px-4 py-2 text-white rounded-2xl bg-blue-500  cursor-pointer hover:bg-blue-600 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatForm;
