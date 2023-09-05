"use client";
import { Row } from "@/util/database-util.types";
import { Avatar } from "antd";
import { User } from "../context";

export function OtherUsersMessages(props: {
  message: Row<"public", "message">;
  profile: User;
}) {
  return (
    <div className="flex flex-row items-start justify-end w-full gap-3">
      <div className="relative ml-4 inline-block max-w-[75%] rounded-md bg-[var(--mid-grey)] p-3 text-left leading-6 text-white">
        <div className="text-sm underline">{props.profile?.full_name}</div>
        <div>{props.message.text} </div>
      </div>
      <Avatar src={props.profile.img_url} />
    </div>
  );
}
