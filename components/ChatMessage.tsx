import React from "react";
import UserNameIcon from "@/components/UserNameIcon";

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
      <section className={`flex   ${
        !isSystemMessage ? 'flex-col items-end' : 'flex-row  items-center gap-4 '}`}>

          
          

        <div className="flex gap-4 items-center">
          {!isOwnMessage && !isSystemMessage && <UserNameIcon name={sender} />}
               
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              isSystemMessage
                ? "bg-gray-800 text-white text-center text-xs"
                : isOwnMessage
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {/* {!isSystemMessage &&  !isOwnMessage && <p className="text-sm font-bold">{sender}</p>} */}

            <p className="">{message}</p>
          </div>
        </div>

        {timestamp && (
          <p className="text-[10px] text-gray-400 mt-1 text-right">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </section>
    </div>
  );
}

export default ChatMessage;
