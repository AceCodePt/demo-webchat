"use client";
import { Row } from "@/util/database-util.types";
import Image from "next/image";
import { User } from "../context";

export function UserMessage(props: {
  message: Row<"public", "message">;
  profile: User;
}) {
  return (
    <div className="flex items-start justify-start gap-3">
      <Image
        className="h-[30px] w-[30px]"
        width={30}
        height={30}
        alt={props.profile.full_name || ""}
        src={
          props.profile?.img_url ||
          "https://st4.depositphotos.com/14903220/22197/v/450/depositphotos_221970610-stock-illustration-abstract-sign-avatar-icon-profile.jpg"
        }
      />
      <div className="relative max-w-[75%] rounded-md bg-[var(--dark-grey)] p-3 text-left leading-6 text-white">
        <div className="text-sm underline">{props.profile?.full_name}</div>
        <div>{props.message.text}</div>
      </div>
    </div>
  );
}
