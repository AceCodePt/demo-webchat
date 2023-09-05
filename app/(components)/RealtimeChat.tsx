"use client";
import { useContext } from "react";
import { MessageContext } from "../context";
import MessageBubble from "./MessageBubble";

export default function Chat() {
  const context = useContext(MessageContext);
  const userId = context.userId;
  return (
    <>
      <div className="flex flex-row flex-grow w-full h-full max-w-lg m-auto bg-gray-100 pb-28">
        <div className="flex flex-col-reverse w-full mx-3 mt-3 overflow-y-auto gap-3">
          {context.messages.map((message) => {
            const profile = context.getProfileOfMessage(message);
            return (
              <MessageBubble
                key={`message-${message.id}`}
                message={{ ...message }}
                profile={profile}
                isMe={profile.id === userId}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
