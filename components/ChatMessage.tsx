import React from "react";

interface ChatMessage {
  sender: string;
  message: string;
  isOwnMessage: boolean;
  timestamp?: string;
  // isSystemMessage:string;
}

function ChatMessage({
  sender,
  message,
  isOwnMessage,
  timestamp,
}: ChatMessage) {
  const isSystemMessage = sender === "system";
  return (
    <div
      className={`flex ${
        isSystemMessage
          ? "justify-center"
          : isOwnMessage
          ? "justify-end"
          : "justify-start"
      }
    mb-3`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isSystemMessage
            ? "bg-gray-800 text-white text-center text-xs"
            : isOwnMessage
            ? "bg-blue-500 text-white"
            : "bg-white text-black"
        }`}
      >
        {!isSystemMessage && <p className="text-sm font-bold">{sender}</p>}
        <p>{message}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1 text-right">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
