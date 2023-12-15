"use client";
import { useEffect, useRef } from "react";
import { useChatMessageProvider } from "../context";
import MessageBubble from "./MessageBubble";

export default function RealtimeChat() {
  const context = useChatMessageProvider();
  const userId = context.userId;
  const messages = context.getMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="m-auto flex h-full w-full max-w-lg flex-grow flex-row bg-gray-100 pb-28">
        <div className="mx-3 mt-3 flex w-full flex-col-reverse gap-3 overflow-y-auto">
          {messages.map((message, index) => {
            return (
              <div
                key={`message-${message.id}-${index}`}
                {...(0 === index ? { ref: messagesEndRef } : {})}
              >
                <MessageBubble
                  message={{ ...message }}
                  profile={message.user}
                  isMe={message.user.id === userId}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
