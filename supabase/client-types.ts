"use client";
import { Database } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabaseClient = createClientComponentClient<Database>();
