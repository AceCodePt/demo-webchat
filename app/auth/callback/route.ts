import { supabaseRoute } from "@/supabase/server-types";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    await supabaseRoute().auth.exchangeCodeForSession(code);
  }

  return redirect(`${url.origin}`);
}
