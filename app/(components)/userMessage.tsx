"use client";
import { Row } from "@/util/database-util.types";
import { Avatar } from "antd";
import { User } from "../context";

export function UserMessage(props: {
  message: Row<"public", "message">;
  profile: User;
}) {
  return (
    <div className="flex items-start justify-start gap-3">
      <Avatar src={props.profile?.img_url} />
      <div className="relative max-w-[75%] rounded-md bg-[var(--dark-grey)] p-3 text-left leading-6 text-white">
        <div className="text-sm underline">{props.profile?.full_name}</div>
        <div>{props.message.text}</div>
      </div>
    </div>
  );
}
