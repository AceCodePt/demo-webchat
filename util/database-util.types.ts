import { Database } from "@/types";

export type Row<
  schema extends "public",
  table extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][table]["Row"];

export type Insert<
  schema extends "public",
  table extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][table]["Insert"];
