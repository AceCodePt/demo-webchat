"use client";
import { Row } from "@/util/database-util.types";
import { User } from "../context";
import { OtherUsersMessages } from "./OtherUsersMessage";
import { UserMessage } from "./userMessage";

export default function MessageBubble(props: {
  message: Row<"public", "message">;
  profile: User;
  isMe: boolean;
}) {
  return (
    <>
      {props.isMe ? (
        <UserMessage message={props.message} profile={props.profile} />
      ) : (
        <OtherUsersMessages message={props.message} profile={props.profile} />
      )}
    </>
  );
}
